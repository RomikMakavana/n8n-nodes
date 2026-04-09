import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import fs from 'fs';

export class FileExists implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'File Exists',
        name: 'fileExists',
        icon: 'file:public/icon.svg',
        group: ['transform'],
        version: 1,
        description: 'Check if a file exists',
        defaults: { name: 'File Exists' },
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
                displayName: 'File Path',
                name: 'filePath',
                type: 'string',
                default: '',
                required: true,
                placeholder: '/home/project/file.txt'
            }
        ]
    };

    async execute(this: IExecuteFunctions) {
        const filePath = this.getNodeParameter('filePath', 0) as string;
        const trueItems: INodeExecutionData[] = [];
        const falseItems: INodeExecutionData[] = [];
    
        if (!await fs.existsSync(filePath) || !await fs.statSync(filePath).isFile()) {
          falseItems.push(...this.helpers.returnJsonArray([{ success: false, error: `File not found: ${filePath}` }]));
        }else{
            trueItems.push(...this.helpers.returnJsonArray([{ success: true, output: 'File exists' }]));
        }
    
        return [trueItems, falseItems];
    }
}