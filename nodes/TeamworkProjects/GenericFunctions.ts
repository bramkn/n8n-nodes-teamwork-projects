import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import {
	BasicFilter,
	EndpointConfig,
	EndpointParameter,
	LoadedResource,
	optionsFromConfig,
	TeamworkProjectsApiCredentials,
} from './types';
import { listenerCount } from 'process';

import defintions from "./definitionconfig.json";
import endpoints from "./endpointconfig.json";



export async function teamworkProjectsApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	const credentials = await this.getCredentials('teamworkProjectsApi') as TeamworkProjectsApiCredentials;
	const options: OptionsWithUri = {
		headers: {
		},
		method,
		body,
		qs,
		auth: {
			user: credentials.apiToken,
		},
		uri: `${credentials.host}${endpoint}`,
		json: true,
		gzip: true,
		rejectUnauthorized: true,
	};

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}
	try {
		return await this.helpers.request!(options);
	} catch (error:any) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function teamworkApiGetRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpoint:string,
	qs:IDataObject ={}){

	const returnItems: INodeExecutionData[] = [];

	qs['page'] = 1;
	qs['pageSize'] = 100;

	let dataArray;

	do{
		const data = await teamworkProjectsApiRequest.call(this,'Get', endpoint, {}, qs);

		qs['page'] += 1;

		dataArray = [].concat(data[`${Object. keys(data)[0]}`]);

		for (let dataIndex = 0; dataIndex < dataArray.length; dataIndex++) {
			const newItem: INodeExecutionData = {
				json: {},
				binary: {},
			};
			newItem.json = dataArray[dataIndex];
			returnItems.push(newItem);
		}
	} while (dataArray.length===qs['pageSize']);
	return returnItems;
}



export async function getEndPointCategories(){
	return [...new Set(endpoints.map((item)=>item.group))];

}

export async function getEndPointOperations(resource:string){
	return endpoints.filter(x=>x.group === resource).map((item)=>item.description);

}

export async function getEndpointConfig(resource:string, operation:string){
	return endpoints.find(x=>x.group === resource && x.description === operation) as EndpointConfig;
}

export async function getEndpointFilterOptions(endpointConfig:EndpointConfig){
	return endpointConfig.parameters.filter(
		x=> x.in ==='query'
	&& x.name !=='page'
	&& x.name !=='pageSize'
	&& x.name !=='orderMode'
	&& x.name !=='orderBy').map((item)=>({"name":item.name,"value":item.name,"description":item.enum ? "<p>"+item.type +" possible options:" + item.enum + "<p>":null})) as optionsFromConfig[];
}

export async function getEndPoints(){
	return [...new Set(endpoints.map((item)=>item.endpoint))];

}

export async function getQueryFilters(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	parameters:EndpointParameter[],
	itemIndex:number
){
	const qs:IDataObject = {};
	const filters = await this.getNodeParameter('parameters.basicFilter', itemIndex, []) as BasicFilter[];
	for(var index = 0; index<filters.length; index++){
		const filterConfig = parameters.find(x => x.name === filters[index].field);
		if(filterConfig?.type ==='string'){
			qs[filters[index].field] = filters[index].value;
		}
	}
	return qs
}

export const toOptions = (items: LoadedResource[]) =>
	items.map(({ name, id }) => ({ name: name, value: id }));

export const arrayToOptions = (items: string[]) =>
	items.map((name) => ({ name: name, value: name }));
