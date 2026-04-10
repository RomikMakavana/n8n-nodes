# N8N Custom Nodes Development & Publishing Tool

This repository provides a streamlined development environment for creating custom n8n nodes with automatic publishing to your local n8n installation.

## 🚀 Features

- **TypeScript Development**: Full TypeScript support with proper type definitions
- **Automatic Build System**: Compile TypeScript nodes to JavaScript
- **Local Publishing**: Automatically publish custom nodes to your local n8n installation via symlinks
- **Package Generation**: Auto-generates `package.json` files for each custom node
- **Development Hot-reload**: Changes are immediately available in your local n8n instance

## 📁 Project Structure

```
n8n-custom-nodes/
├── Gruntfile.cjs           # Build and publishing automation
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment configuration template
└── n8n-nodes/              # Custom nodes directory
    └── dircommand/         # Example custom node
        └── nodes/
            └── DirCommand.node.ts
```

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- n8n installed locally
- Basic knowledge of TypeScript and n8n node development

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd n8n-custom-nodes
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set `DEST_PATH` to your n8n custom nodes directory:
   ```bash
   DEST_PATH=/Users/yourusername/.n8n/custom
   ```

   **Symlinks:** `npm run publish-local` creates symlinks from each built node under `dist/n8n-nodes/` into `DEST_PATH`. If a path already exists and is a symlink, the publish step checks that it points at the current build output. When something points elsewhere, you get a summary and a prompt (**Replace all incorrect symlinks? [y/N]**) in an interactive terminal. In non-interactive environments (for example CI), the task stops with an error unless you opt in to automatic fixes:

   ```bash
   PUBLISH_LOCAL_REPLACE_SYMLINKS=1 npm run publish-local
   ```

   Or run only the symlink step:

   ```bash
   PUBLISH_LOCAL_REPLACE_SYMLINKS=1 npx grunt symlinkValidated
   npx grunt symlinkValidated --replace-symlinks
   ```

   If a name under `DEST_PATH` exists but is **not** a symlink (a normal file or directory), the task fails with an error so nothing is deleted by mistake.

## 🎯 Quick Start

### Creating a New Custom Node

1. **Create a new directory** under `n8n-nodes/`:
   ```bash
   mkdir n8n-nodes/mynewnode
   mkdir n8n-nodes/mynewnode/nodes
   ```

2. **Create your node file** `n8n-nodes/mynewnode/nodes/MyNewNode.node.ts`:
   ```typescript
   import { INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';

   export class MyNewNode implements INodeType {
     description: INodeTypeDescription = {
       displayName: 'My New Node',
       name: 'myNewNode',
       group: ['transform'],
       version: 1,
       description: 'Description of what your node does',
       defaults: { name: 'My New Node' },
       inputs: ['main'],
       outputs: ['main'],
       properties: [
         // Define your node properties here
       ]
     };

     async execute(this: IExecuteFunctions) {
       // Implement your node logic here
       return [this.helpers.returnJsonArray([{ result: 'success' }])];
     }
   }
   ```

3. **Build and publish your node:**
   ```bash
   npm run publish-local
   ```

4. **Restart n8n** to load your new custom node.

## 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Build** | `npm run build` | Compiles TypeScript files to JavaScript |
| **Publish Local** | `npm run publish-local` | Builds and publishes nodes to local n8n installation |

## 📋 Development Workflow

### 1. Development Phase
- Write your custom node in TypeScript under `n8n-nodes/[node-name]/nodes/`
- Use the existing `DirCommand` node as a reference
- Test your TypeScript compilation with `npm run build`

### 2. Testing Phase
- Run `npm run publish-local` to deploy to your local n8n
- Restart your n8n instance
- Test your node in n8n's workflow editor

### 3. Iteration
- Make changes to your TypeScript files
- Run `npm run publish-local` again
- Restart n8n to see changes

## 🏗️ Build System Details

### TypeScript Compilation
- **Input**: `n8n-nodes/**/nodes/**/*.ts`
- **Output**: `dist/n8n-nodes/[node-name]/nodes/[NodeName].node.js`
- **Configuration**: `tsconfig.json`

### `public` directory
- Each node have `public` folder, that can contains public assets need to use inside command like icon, image etc..
- So, when run build command it will automatically copy public directory with it

### Package Generation
The Grunt build system automatically:
1. Scans for compiled `.node.js` files
2. Generates `package.json` for each node directory
3. Creates symlinks to your local n8n custom directory, reusing correct existing symlinks and validating targets (see **Symlinks** under configuration above)

### Example Generated Package.json
```json
{
  "name": "dircommand",
  "version": "1.0.0",
  "n8n": {
    "nodes": [
      "nodes/DirCommand.node.js"
    ]
  }
}
```

## 🎨 Example: Directory Command Node

The repository includes a complete example node (`DirCommand`) that demonstrates:

- **Parameters**: Directory path and shell commands
- **Validation**: Checks if directory exists
- **Execution**: Runs shell commands within the specified directory
- **Error Handling**: Proper error responses
- **Multiple Commands**: Support for multiple commands separated by `;;`

### Usage Example
```typescript
// Node parameters:
// Directory Path: /home/user/project
// Command(s): ls -la;; npm list;; git status

// Output:
{
  "success": true,
  "output": "total 24\ndrwxr-xr-x 3 user user 4096...\n\npackage@1.0.0\n├── dependency@1.0.0\n...\n\nOn branch main\nYour branch is up to date..."
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Node not appearing in n8n:**
   - Ensure n8n is restarted after publishing
   - Check that `DEST_PATH` points to correct directory
   - Verify symlinks were created successfully
   - If publish reports a symlink target mismatch, either confirm the prompt to replace links or run with `PUBLISH_LOCAL_REPLACE_SYMLINKS=1` (or `npx grunt symlinkValidated --replace-symlinks`)

2. **TypeScript compilation errors:**
   - Check `tsconfig.json` configuration
   - Ensure all required dependencies are installed
   - Verify node file follows n8n node interface

3. **Runtime errors:**
   - Check n8n logs for detailed error messages
   - Validate node parameters and execution logic
   - Test node logic independently before integration

### Debugging Tips

- Use `console.log()` statements in your node for debugging
- Check n8n's log files for runtime errors
- Test TypeScript compilation with `npm run build` before publishing

## 📚 Resources

- [n8n Node Development Documentation](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Workflow Package](https://www.npmjs.com/package/n8n-workflow)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with local n8n installation
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🎯 Next Steps

After setting up this development environment:

1. **Explore the example node** (`DirCommand`) to understand the structure
2. **Create your first custom node** following the quick start guide
3. **Iterate and test** using the local publishing feature
4. **Share your nodes** with the n8n community

Happy node development! 🚀