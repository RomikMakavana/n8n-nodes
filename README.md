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

### Package Generation
The Grunt build system automatically:
1. Scans for compiled `.node.js` files
2. Generates `package.json` for each node directory
3. Creates symlinks to your local n8n custom directory

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