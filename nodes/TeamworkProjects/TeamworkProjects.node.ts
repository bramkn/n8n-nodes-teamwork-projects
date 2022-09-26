import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { customFieldOptions } from './CustomFieldDescription';
import { fieldOptions } from './FieldDescription';
import { filterOptions } from './FilterDescription';
import { arrayToOptions, getBody, getCustomBody, getEndPointCategories, getEndpointConfig, getEndpointFieldOptions, getEndpointFilterOptions, getEndPointOperations, getEndPoints, getQueryFilters, teamworkApiGetRequest, teamworkApiRequest, teamworkProjectsApiRequest } from './GenericFunctions';
import { EndpointConfig, EndpointParameter, LoadedResource, optionsFromConfig, TeamworkProjectsApiCredentials } from './types';

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
				displayOptions:{
					hide:{
						resource:['v1ApiCustom'],
					},
				},
				description: 'Operation to perform',
			},
			{
				displayName: 'Id',
				name: 'id',
				type: 'string',
				default: '',
				displayOptions:{
					hide:{
						resource:['v1ApiCustom'],
					},
				},
				description: 'When performing an operation on a specific record, this Id needs to be entered with the Id for the record of that resource',
			},
			...filterOptions,
			...fieldOptions,
			...customFieldOptions,
		],
	};

	methods = {
		loadOptions: {
			async getResources(this: ILoadOptionsFunctions) {
				const resources = await getEndPointCategories();
				resources.push('v1ApiCustom');
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
			async getFields(this: ILoadOptionsFunctions) {
				const resource = this.getNodeParameter('resource', 0) as string;
				const operation = this.getNodeParameter('operation', 0) as string;
				const endpointConfig:EndpointConfig = await getEndpointConfig(resource,operation);
				const fields = await getEndpointFieldOptions(endpointConfig);

				return fields as optionsFromConfig[];
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];

		const resource = await this.getNodeParameter('resource', 0, '') as string;
		const operation = await this.getNodeParameter('operation', 0, '') as string;
		if(resource ==='v1ApiCustom'){
			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				try {
					const endpoint = await this.getNodeParameter('endpoint', 0, '') as string;
					const method = await this.getNodeParameter('method', 0, '') as string;
					const object = await this.getNodeParameter('object', 0, '') as string;
					let body = {};
					if(method ==='post' || method ==='patch' || method ==='put'){
						body = await getCustomBody.call(this,object,itemIndex);
						const getResult = await teamworkApiRequest.call(this,endpoint, method, body, {});
						returnItems.push(getResult);
					}
					if(method ==='delete'){
						const getResult = await teamworkApiRequest.call(this,endpoint, method, body, {});
						returnItems.push(getResult);
					}
					else{
						const getResult:INodeExecutionData[] = await teamworkApiGetRequest.call(this,endpoint,{}) as INodeExecutionData[];
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
		}
		else{
			const endpointConfig:EndpointConfig = await getEndpointConfig(resource,operation);
			let endpoint = endpointConfig.endpoint;
			const endpointId = endpointConfig.parameters.find(x => x.in ==='path')?.name as string ?? '';

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
						if(endpointConfig.method === 'post' || endpointConfig.method === 'patch' || endpointConfig.method === 'put'){
							const body = await getBody.call(this,endpointConfig,itemIndex);
							const getResult = await teamworkApiRequest.call(this,endpoint, endpointConfig.method, body, {});
							returnItems.push(getResult);
						}
						if(endpointConfig.method === 'delete'){
							const getResult = await teamworkApiRequest.call(this,endpoint, endpointConfig.method, {}, {});
							returnItems.push({json:{result:'OK'}});
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
		}
		return this.prepareOutputData(returnItems);
	}
}
