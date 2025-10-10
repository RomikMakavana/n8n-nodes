const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

module.exports = function (grunt) {
  // Source and destination folders
  const sourceFolder = './dist/n8n-nodes';
  const destFolder = process.env.DEST_PATH;

  // Read all directories in source folder
  const dirs = fs.readdirSync(sourceFolder).filter(file => {
    return fs.statSync(path.join(sourceFolder, file)).isDirectory();
  });

  // Build symlink config dynamically
  const symlinkConfig = {};
  dirs.forEach(dir => {
    symlinkConfig[dir] = {
      src: path.join(sourceFolder, dir),
      dest: path.join(destFolder, dir)
    };
  });


  // Project configuration
  grunt.initConfig({
    symlink: symlinkConfig
  });

  grunt.loadNpmTasks('grunt-contrib-symlink');

  grunt.registerTask('generatePackageJson', 'Generate package.json for N8N nodes', function () {
    const n8nNodesPath = path.join(sourceFolder);

    if (!fs.existsSync(n8nNodesPath)) {
      grunt.log.error(`Directory ${n8nNodesPath} does not exist`);
      return;
    }

    const nodeFolders = fs.readdirSync(n8nNodesPath).filter(f => {
      return fs.statSync(path.join(n8nNodesPath, f)).isDirectory();
    });

    nodeFolders.forEach(folder => {
      const nodesDir = path.join(n8nNodesPath, folder, 'nodes');
      if (!fs.existsSync(nodesDir)) {
        grunt.log.warn(`Folder ${nodesDir} does not exist, skipping`);
        return;
      }

      const nodeFiles = fs.readdirSync(nodesDir)
        .filter(f => f.endsWith('.node.js'))
        .map(f => `nodes/${f}`);

      if (nodeFiles.length === 0) {
        grunt.log.warn(`No .node.js files found in ${nodesDir}, skipping`);
        return;
      }

      const packageJson = {
        name: folder.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        n8n: {
          nodes: nodeFiles
        }
      };

      const packageJsonPath = path.join(n8nNodesPath, folder, 'package.json');
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      grunt.log.ok(`Generated package.json for ${folder}`);
    });
  });

  grunt.registerTask('default', ['generatePackageJson', 'symlink']);
};
