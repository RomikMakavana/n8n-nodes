import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  INodeExecutionData,
} from 'n8n-workflow';
import fs from 'fs/promises';
import path from 'path';

export class WriteFileUtf8 implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Write File (UTF-8)',
    name: 'writeFileUtf8',
    icon: 'file:public/icon.svg',
    group: ['transform'],
    version: 1,
    description: 'Write text to a file using UTF-8 encoding',
    defaults: { name: 'Write File (UTF-8)' },
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
        placeholder: '/home/project/output.txt',
        description: 'Absolute or relative path where the file will be written',
      },
      {
        displayName: 'File Content',
        name: 'fileContent',
        type: 'string',
        default: '',
        typeOptions: {
          rows: 10,
        },
        description: 'Text to write to the file (UTF-8)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const successItems: INodeExecutionData[] = [];
    const failureItems: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const filePath = this.getNodeParameter('filePath', i) as string;
      const fileContent = this.getNodeParameter('fileContent', i) as string;

      try {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, fileContent, { encoding: 'utf8' });
        successItems.push(
          ...this.helpers.returnJsonArray([
            {
              success: true,
              filePath,
              message: 'File written successfully',
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
