const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

function canonicalPath(p) {
  const resolved = path.normalize(path.resolve(p));
  try {
    if (fs.existsSync(resolved)) {
      return fs.realpathSync(resolved);
    }
  } catch (_) {
    /* keep resolved */
  }
  return resolved;
}

function symlinkTargetMatchesDest(src, dest) {
  const linkRaw = fs.readlinkSync(dest);
  const actual = canonicalPath(path.resolve(path.dirname(dest), linkRaw));
  const expected = canonicalPath(src);
  return actual === expected;
}

function computeLinkSrcForSymlink(src, dest) {
  let srcpath = src;
  const destpath = dest.replace(/[/\\]$/, '');
  const destdir = path.join(destpath, '..');
  if (!path.isAbsolute(srcpath)) {
    srcpath = path.relative(destdir, srcpath) || '.';
  }
  return { destpath, destdir, srcpath };
}

function lstatDest(dest) {
  try {
    return fs.lstatSync(dest);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    }
    throw e;
  }
}

function createDirSymlink(src, dest, grunt) {
  if (!fs.existsSync(src)) {
    grunt.log.warn(`Source "${src}" not found, skipping.`);
    return false;
  }
  const { destpath, destdir, srcpath } = computeLinkSrcForSymlink(src, dest);
  fs.mkdirSync(destdir, { recursive: true });
  fs.symlinkSync(srcpath, destpath, 'dir');
  grunt.verbose.ok(`Linked ${destpath} -> ${srcpath}`);
  return true;
}

module.exports = function (grunt) {
  const sourceFolder = './dist/n8n-nodes';
  const destFolder = process.env.DEST_PATH;

  grunt.initConfig({
    copy: {
      assets: {
        expand: true,
        cwd: 'n8n-nodes',
        src: ['**/public/**/*'],
        dest: 'dist/n8n-nodes',
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('generatePackageJson', 'Generate package.json for N8N nodes', function () {
    const n8nNodesPath = path.join(sourceFolder);

    if (!fs.existsSync(n8nNodesPath)) {
      grunt.log.error(`Directory ${n8nNodesPath} does not exist`);
      return;
    }

    const nodeFolders = fs.readdirSync(n8nNodesPath).filter((f) => {
      return fs.statSync(path.join(n8nNodesPath, f)).isDirectory();
    });

    nodeFolders.forEach((folder) => {
      const nodesDir = path.join(n8nNodesPath, folder, 'nodes');
      if (!fs.existsSync(nodesDir)) {
        grunt.log.warn(`Folder ${nodesDir} does not exist, skipping`);
        return;
      }

      const nodeFiles = fs
        .readdirSync(nodesDir)
        .filter((f) => f.endsWith('.node.js'))
        .map((f) => `nodes/${f}`);

      if (nodeFiles.length === 0) {
        grunt.log.warn(`No .node.js files found in ${nodesDir}, skipping`);
        return;
      }

      const packageJson = {
        name: folder.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        n8n: {
          nodes: nodeFiles,
        },
      };

      const packageJsonPath = path.join(n8nNodesPath, folder, 'package.json');
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      grunt.log.ok(`Generated package.json for ${folder}`);
    });
  });

  grunt.registerTask('symlinkValidated', 'Create symlinks; validate existing targets.', function () {
    const done = this.async();

    const replaceSymlinks =
      Boolean(grunt.option('replace-symlinks')) ||
      process.env.PUBLISH_LOCAL_REPLACE_SYMLINKS === '1';

    if (!destFolder) {
      grunt.fail.fatal(
        'DEST_PATH is not set. Add it to your .env (see .env.example).',
      );
    }

    const run = async () => {
      if (!fs.existsSync(sourceFolder)) {
        grunt.fail.fatal(
          `Directory ${sourceFolder} does not exist. Run npm run build first.`,
        );
      }

      const dirs = fs.readdirSync(sourceFolder).filter((file) => {
        return fs.statSync(path.join(sourceFolder, file)).isDirectory();
      });

      const pairs = dirs.map((dir) => ({
        dir,
        src: path.join(sourceFolder, dir),
        dest: path.join(destFolder, dir),
      }));

      let created = 0;
      let skippedOk = 0;
      const mismatches = [];
      const nonSymlinkBlocks = [];

      for (const { dir, src, dest } of pairs) {
        const st = lstatDest(dest);
        if (st === null) {
          if (createDirSymlink(src, dest, grunt)) {
            grunt.log.ok(`Created symlink ${dest} -> ${src}`);
            created++;
          }
          continue;
        }

        if (!st.isSymbolicLink()) {
          nonSymlinkBlocks.push({ dest, dir });
          continue;
        }

        if (symlinkTargetMatchesDest(src, dest)) {
          grunt.log.ok(`Symlink already correct: ${dest}`);
          skippedOk++;
        } else {
          const linkRaw = fs.readlinkSync(dest);
          const currentResolved = path.resolve(path.dirname(dest), linkRaw);
          mismatches.push({
            dir,
            dest,
            current: currentResolved,
            expected: path.resolve(src),
          });
        }
      }

      for (const { dest, dir } of nonSymlinkBlocks) {
        grunt.fail.fatal(
          `Destination "${dest}" (${dir}) exists and is not a symlink. Remove or rename it manually, then run publish-local again.`,
        );
      }

      if (mismatches.length === 0) {
        grunt.log.ok(
          `Symlinks: ${created} created, ${skippedOk} already correct.`,
        );
        done();
        return;
      }

      grunt.log.writeln('');
      grunt.log.writeln('Symlink target mismatch:');
      mismatches.forEach((m) => {
        grunt.log.writeln(`  ${m.dir}`);
        grunt.log.writeln(`    dest:     ${m.dest}`);
        grunt.log.writeln(`    current:  ${m.current}`);
        grunt.log.writeln(`    expected: ${m.expected}`);
      });
      grunt.log.writeln('');

      const tty = process.stdin.isTTY && process.stdout.isTTY;
      let shouldReplace = replaceSymlinks;

      if (!shouldReplace && tty) {
        shouldReplace = await new Promise((resolve) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.question('Replace all incorrect symlinks? [y/N] ', (answer) => {
            rl.close();
            resolve(/^y(es)?$/i.test(String(answer).trim()));
          });
        });
      }

      if (!shouldReplace) {
        grunt.fail.fatal(
          'Symlink targets do not match the build output. Fix: run with PUBLISH_LOCAL_REPLACE_SYMLINKS=1 or grunt symlinkValidated --replace-symlinks',
        );
      }

      for (const m of mismatches) {
        fs.unlinkSync(m.dest);
        if (createDirSymlink(m.expected, m.dest, grunt)) {
          grunt.log.ok(`Replaced symlink ${m.dest} -> ${m.expected}`);
          created++;
        }
      }

      grunt.log.ok(
        `Symlinks: ${created} created/replaced, ${skippedOk} already correct.`,
      );
      done();
    };

    run().catch((err) => {
      grunt.log.error(err);
      done(false);
    });
  });

  grunt.registerTask('default', ['generatePackageJson', 'copy', 'symlinkValidated']);
};
