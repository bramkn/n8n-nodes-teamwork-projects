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
	LoadedResource,
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
	const credentials = await this.getCredentials('teamworkProjects') as TeamworkProjectsApiCredentials;
	const options: OptionsWithUri = {
		headers: {
		},
		method,
		body,
		qs,
		auth: {
			user: credentials.apiToken,
		},
		uri: `${credentials.host}/${endpoint}.json`,
		json: true,
		gzip: true,
		rejectUnauthorized: true,
	};
	console.log(options.uri);

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


export async function getEndPointCategories(){
	return [...new Set(endpoints.map((item)=>item.group))];

}

export async function getEndPointOperations(resource:string){
	return [...new Set(endpoints.filter(x=>x.group === resource).map((item)=>item.description))];

}


export const toOptions = (items: LoadedResource[]) =>
	items.map(({ name, id }) => ({ name: name, value: id }));

export const arrayToOptions = (items: string[]) =>
	items.map((name) => ({ name: name, value: name }));
