import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class JoinPath implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Join Path',
    name: 'joinPath',
    icon: 'file:public/icon.svg',
    group: ['transform'],
    version: 1,
    description: 'Join two paths together',
    defaults: { name: 'Join Path' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Sub Paths',
        name: 'subPaths',
        type: 'string',
        typeOptions: {
            multipleValues: true,  // allows dynamic add/remove
            allowCustomValues: true, // optional
        },
        default: [],
        placeholder: 'Add Sub Path',
        description: 'Enter one or more sub paths',
    }
    ]
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
        // Get the array of Sub Paths
        const subPaths = this.getNodeParameter('subPaths', i, []) as string[];

        // Combine them using Node.js path.join
        const combined = path.join(...subPaths);

        // Push result
        returnData.push({
            json: {
                combinedSubPaths: combined,
                subPaths, // optional: include original array
            },
        });
    }

    return this.prepareOutputData(returnData);
}
}
