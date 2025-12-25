import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import fs from 'fs';

export class DirExists implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Directory Exists',
        name: 'dirExists',
        icon: 'file:public/icon.svg',
        group: ['transform'],
        version: 1,
        description: 'Check if a directory exists',
        defaults: { name: 'Directory Exists' },
        inputs: ['main'],
        outputs: [
            {
                type: 'main',
                displayName: 'Success',
            }, {
                type: 'main',
                displayName: 'Failure',
            }
        ],
        properties: [
            {
                displayName: 'Directory Path',
                name: 'directoryPath',
                type: 'string',
                default: '',
                required: true,
                placeholder: '/home/project'
            }
        ]
    };

    async execute(this: IExecuteFunctions) {
        const directoryPath = this.getNodeParameter('directoryPath', 0) as string;
        const trueItems: INodeExecutionData[] = [];
        const falseItems: INodeExecutionData[] = [];
    
        if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
          falseItems.push(...this.helpers.returnJsonArray([{ success: false, error: `Directory not found: ${directoryPath}` }]));
        }else{
            trueItems.push(...this.helpers.returnJsonArray([{ success: true, output: 'Directory exists' }]));
        }
    
        return [trueItems, falseItems];
    }
}