import { IExecuteFunctions } from 'n8n-core';
import {
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { getEndPointCategories, teamworkProjectsApiRequest } from './GenericFunctions';
import { LoadedResource, TeamworkProjectsApiCredentials } from './types';

export class TeamworkProjects implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Teamwork Projects',
		name: 'teamworkProjects',
		icon: 'file:teamworkprojects.svg',
		group: ['transform'],
		version: 1,
		description: 'Teamwork Projects',
		defaults: {
			name: 'Teamwork Projects',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'teamworkProjectsApi',
				required: true,
			},
		],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getResources',
				},
				description: 'Teamwork Projects resource',
			},
		],
	};

	methods = {
		loadOptions: {
			async getResources(this: ILoadOptionsFunctions) {
				const groups = await getEndPointCategories();

				return [{name:'',value:''}]//toOptions(users as LoadedResource[]);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let myString: string;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				myString = this.getNodeParameter('myString', itemIndex, '') as string;
				item = items[itemIndex];

				item.json['myString'] = myString;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return this.prepareOutputData(items);
	}
}
