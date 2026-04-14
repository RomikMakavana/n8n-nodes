import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import fs from 'fs';
import path from 'path';

export class DeleteDirectory implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Delete Directory',
		name: 'deleteDirectory',
		icon: 'file:public/icon.svg',
		group: ['transform'],
		version: 1,
		description: 'Delete a directory, or only its contents',
		defaults: { name: 'Delete Directory' },
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Directory Path',
				name: 'directoryPath',
				type: 'string',
				default: '',
				required: true,
				placeholder: '/home/project/data',
				description: 'Absolute or relative path of the directory to delete or to clear',
			},
			{
				displayName: 'Delete only all sub items',
				name: 'deleteSubItemsOnly',
				type: 'boolean',
				default: false,
				description:
					'When enabled, removes every file and folder inside the directory but keeps the directory itself. When disabled, removes the directory and everything inside it.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const directoryPath = this.getNodeParameter('directoryPath', i) as string;
			const deleteSubItemsOnly = this.getNodeParameter('deleteSubItemsOnly', i, false) as boolean;

			const trimmed = directoryPath.trim();
			if (!trimmed) {
				throw new Error('Directory path is required');
			}

			if (!fs.existsSync(trimmed)) {
				throw new Error(`Directory does not exist: ${trimmed}`);
			}

			const stat = fs.statSync(trimmed);
			if (!stat.isDirectory()) {
				throw new Error(`Path is not a directory: ${trimmed}`);
			}

			if (deleteSubItemsOnly) {
				const entries = fs.readdirSync(trimmed);
				for (const entry of entries) {
					fs.rmSync(path.join(trimmed, entry), { recursive: true, force: true });
				}
				returnData.push({
					json: {
						directoryPath: trimmed,
						deleteSubItemsOnly: true,
						removedEntries: entries,
					},
				});
			} else {
				fs.rmSync(trimmed, { recursive: true, force: true });
				returnData.push({
					json: {
						directoryPath: trimmed,
						deleteSubItemsOnly: false,
						deleted: true,
					},
				});
			}
		}

		return this.prepareOutputData(returnData);
	}
}
