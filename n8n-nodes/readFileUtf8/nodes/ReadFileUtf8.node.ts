import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  INodeExecutionData,
} from 'n8n-workflow';
import fs from 'fs/promises';

export class ReadFileUtf8 implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Read File (UTF-8)',
    name: 'readFileUtf8',
    icon: 'file:public/icon.svg',
    group: ['transform'],
    version: 1,
    description: 'Read a text file from disk using UTF-8 encoding',
    defaults: { name: 'Read File (UTF-8)' },
    inputs: ['main'],
    outputs: [
      {
        type: 'main',
        displayName: 'Success',
      },
      {
        type: 'main',
        displayName: 'Failure',
      },
    ],
    properties: [
      {
        displayName: 'File Path',
        name: 'filePath',
        type: 'string',
        default: '',
        required: true,
        placeholder: '/home/project/input.txt',
        description: 'Absolute or relative path of the file to read',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const successItems: INodeExecutionData[] = [];
    const failureItems: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const filePath = this.getNodeParameter('filePath', i) as string;

      try {
        const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
        successItems.push(
          ...this.helpers.returnJsonArray([
            {
              success: true,
              filePath,
              fileContent,
              message: 'File read successfully',
            },
          ]),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failureItems.push(
          ...this.helpers.returnJsonArray([
            {
              success: false,
              filePath,
              error: message,
            },
          ]),
        );
      }
    }

    return [successItems, failureItems];
  }
}
