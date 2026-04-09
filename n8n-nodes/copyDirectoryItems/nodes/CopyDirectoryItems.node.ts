import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import fs from 'fs';
import path from 'path';

export class CopyDirectoryItems implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Copy Directory Items',
    name: 'copyDirectoryItems',
    icon: 'file:public/icon.svg',
    group: ['transform'],
    version: 1,
    description: 'Copy items from one directory to another',
    defaults: { name: 'Copy Directory Items' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Source Directory',
        name: 'sourceDirectory',
        type: 'string',
        default: '',
        placeholder: '/home/source',
        description: 'Source directory to copy items from',
    },
      {
        displayName: 'Destination Directory',
        name: 'destinationDirectory',
        type: 'string',
        default: '',
        placeholder: '/home/destination',
        description: 'Destination directory to copy items to',
    },
      {
        displayName: 'Item To Copy',
        name: 'itemsToCopy',
        type: 'string',
        typeOptions: {
            multipleValues: true,
        },
        default: [],
        placeholder: 'Add Item To Copy',
        description: 'Enter each item to copy',
    }
    ]
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
        const sourceDirectory = this.getNodeParameter('sourceDirectory', i) as string;
        const destinationDirectory = this.getNodeParameter('destinationDirectory', i) as string;
        const itemsToCopy = this.getNodeParameter('itemsToCopy', i, []) as string[];

        // Check if source directory exists
        if (!await fs.existsSync(sourceDirectory)) {
            throw new Error(`Source directory does not exist: ${sourceDirectory}`);
        }

        // Ensure destination directory exists
        if (!await fs.existsSync(destinationDirectory)) {
            await fs.mkdirSync(destinationDirectory, { recursive: true });
        }

        const copiedItems: string[] = [];

        for (const item of itemsToCopy) {
            const sourcePath = path.join(sourceDirectory, item);
            const destPath = path.join(destinationDirectory, item);

            if (!await fs.existsSync(sourcePath)) {
                throw new Error(`Item does not exist in source directory: ${item}`);
            }

            // Delete first if exists in destination
            if (await fs.existsSync(destPath)) {
              const stat = await fs.statSync(destPath);
              if (stat.isDirectory()) {
                  await fs.rmdirSync(destPath, { recursive: true }); // remove directory recursively
              } else if (stat.isFile()) {
                  await fs.unlinkSync(destPath); // remove file
              }
            }

            // Copy file or directory recursively
            await fs.cpSync(sourcePath, destPath, { recursive: true });

            copiedItems.push(item);
        }

        returnData.push({
            json: {
                sourceDirectory,
                destinationDirectory,
                copiedItems,
            },
        });
    }

    return this.prepareOutputData(returnData);
}
}
