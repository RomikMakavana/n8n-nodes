import { INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';
import { execSync } from 'child_process';
import fs from 'fs';

export class DirCommand implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Directory Command Runner',
    name: 'dirCommandRunner',
    group: ['transform'],
    version: 1,
    description: 'Run one or multiple shell commands inside a directory if it exists',
    defaults: { name: 'Dir Command Runner' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Directory Path',
        name: 'directoryPath',
        type: 'string',
        default: '',
        required: true,
        placeholder: '/home/project'
      },
      {
        displayName: 'Command(s)',
        name: 'command',
        type: 'string',
        default: '',
        placeholder: 'Separate multiple commands with ;;',
        description: 'Commands to run in the directory. Use ;; to separate multiple commands.',
        required: true
      }
    ]
  };

  async execute(this: IExecuteFunctions) {
    const directoryPath = this.getNodeParameter('directoryPath', 0) as string;
    const commandsInput = this.getNodeParameter('command', 0) as string;

    if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
      return [this.helpers.returnJsonArray([{ success: false, error: `Directory not found: ${directoryPath}` }])];
    }

    const commands = commandsInput.split(';;').map(cmd => cmd.trim()).filter(Boolean);
    let output = '';

    try {
      for (const cmd of commands) {
        output += execSync(`cd "${directoryPath}" && ${cmd}`, { encoding: 'utf8' }) + '\n';
      }
      return [this.helpers.returnJsonArray([{ success: true, output }])];
    } catch (error: any) {
      return [this.helpers.returnJsonArray([{ success: false, error: error.message }])];
    }
  }
}
