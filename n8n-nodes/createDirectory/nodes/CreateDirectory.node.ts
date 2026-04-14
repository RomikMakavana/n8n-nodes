import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import fs from 'fs';

export class CreateDirectory implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Create Directory',
		name: 'createDirectory',
		icon: 'file:public/icon.svg',
		group: ['transform'],
		version: 1,
		description: 'Create a directory at the given path (including parent directories)',
		defaults: { name: 'Create Directory' },
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Directory Path',
				name: 'directoryPath',
				type: 'string',
				default: '',
				required: true,
				placeholder: '/home/project/data/new-folder',
				description: 'Absolute or relative path of the directory to create',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const directoryPath = this.getNodeParameter('directoryPath', i) as string;

			const trimmed = directoryPath.trim();
			if (!trimmed) {
				throw new Error('Directory path is required');
			}

			let alreadyExists = false;
			if (fs.existsSync(trimmed)) {
				const stat = fs.statSync(trimmed);
				if (!stat.isDirectory()) {
					throw new Error(`Path exists and is not a directory: ${trimmed}`);
				}
				alreadyExists = true;
			} else {
				fs.mkdirSync(trimmed, { recursive: true });
			}

			returnData.push({
				json: {
					directoryPath: trimmed,
					alreadyExists,
				},
			});
		}

		return this.prepareOutputData(returnData);
	}
}
