import { IExecuteFunctions } from 'n8n-core';
import {
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { filterOptions } from './FilterDescription';
import { arrayToOptions, getEndPointCategories, getEndpointConfig, getEndpointFilterOptions, getEndPointOperations, getEndPoints, getQueryFilters, teamworkApiGetRequest, teamworkProjectsApiRequest } from './GenericFunctions';
import { EndpointConfig, EndpointParameter, LoadedResource, TeamworkProjectsApiCredentials } from './types';

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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsDependsOn:['resource'],
					loadOptionsMethod: 'getOperations',
				},
				description: 'Operation to perform',
			},
			{
				displayName: 'Id',
				name: 'id',
				type: 'string',
				default: '',
				description: 'When performing an operation on a specific record, this Id needs to be entered with the Id for the record of that resource',
			},
			...filterOptions,
		],
	};

	methods = {
		loadOptions: {
			async getResources(this: ILoadOptionsFunctions) {
				const resources = await getEndPointCategories();

				return arrayToOptions(resources as string[]);
			},
			async getOperations(this: ILoadOptionsFunctions) {
				const resource = this.getNodeParameter('resource', 0) as string;
				const operations = await getEndPointOperations(resource);

				return arrayToOptions(operations as string[]);
			},
			async getFilterFields(this: ILoadOptionsFunctions) {
				const resource = this.getNodeParameter('resource', 0) as string;
				const operation = this.getNodeParameter('operation', 0) as string;
				const endpointConfig:EndpointConfig = await getEndpointConfig(resource,operation);
				const filters = await getEndpointFilterOptions(endpointConfig);

				return filters;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let item: INodeExecutionData;
		const returnItems: INodeExecutionData[] = [];

		const resource = await this.getNodeParameter('resource', 0, '') as string;
		const operation = await this.getNodeParameter('operation', 0, '') as string;

		const endpointConfig:EndpointConfig = await getEndpointConfig(resource,operation);
		let endpoint = endpointConfig.endpoint;
		let endpointId = endpointConfig.parameters.find(x => x.in ==='path')?.name as string ?? '';
		console.log(endpoint + ' - ' + endpointId);
		//getEndpointConfig

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				if(endpointId !== ''){
					const id = await this.getNodeParameter('id', 0, '') as string;
					if(id ===''){
						throw new NodeOperationError(this.getNode(), `Please enter the Id of the resource you want to perform the operation on`, {
							itemIndex,
						});
					}
					if(endpoint.includes(':')){
						endpoint = endpoint.replace(`:${endpointId}`,id);
					}
					else{
						endpoint = endpoint.replace(`{${endpointId}}`,id);
					}
				}
				if(endpointConfig.method === 'get'){
					const qs = await getQueryFilters.call(this,endpointConfig.parameters,itemIndex);
					const getResult:INodeExecutionData[] = await teamworkApiGetRequest.call(this,endpoint,qs) as INodeExecutionData[];
						for (let dataIndex = 0; dataIndex < getResult.length; dataIndex++) {
							returnItems.push(getResult[dataIndex]);
						}
				}

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

		return this.prepareOutputData(returnItems);
	}
}
