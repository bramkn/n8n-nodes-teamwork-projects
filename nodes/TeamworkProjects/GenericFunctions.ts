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
	ArrayItemsObject,
	BasicField,
	BasicFilter,
	configSchema,
	EndpointConfig,
	EndpointParameter,
	LoadedResource,
	optionsFromConfig,
	Property,
	TeamworkProjectsApiCredentials,
} from './types';
import { listenerCount } from 'process';
import { get, pick , set, unset } from 'lodash';
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

export async function teamworkApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpoint:string,
	method:string,
	body:IDataObject ={},
	qs:IDataObject ={},
	){

	const data = await teamworkProjectsApiRequest.call(this, method, endpoint, body, qs);

	const newItem: INodeExecutionData = {
		json: {},
		binary: {},
	};
	newItem.json = data;

	return newItem;
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
	&& x.name !=='orderBy').map((item)=>({"name":item.description ?? item.name,"value":item.name,"description":item.enum ? "<p> possible options: " + item.enum + "<p>":null})) as optionsFromConfig[];
}

export async function getEndpointFieldOptions(endpointConfig:EndpointConfig){
	const bodyFields = endpointConfig.parameters.filter(x=> x.in ==='body');
	const array:optionsFromConfig[] =[];
	for(var index =0; index < bodyFields.length; index++){
		const field = bodyFields[index];
		if(field.schema !== undefined){
			const schema = field.schema as configSchema;
			const fieldDef = await getDefinitionPropertiesFromEndpoint(schema.$ref);
			if(fieldDef !== undefined){
				const properties:optionsFromConfig[] = (await getDefinitionArray(fieldDef?.properties)).map((item)=>({"name":item.fieldName,"value":item.fieldName}));
				array.push.apply(array,properties);
			}
		}else{
			array.push({"name":field.description ?? field.name,"value":field.name,"description":field.enum ? "<p> possible options: " + field.enum + "<p>":undefined})
		}

	}
	return array;
}

export async function getEndpointFieldProperties(endpointConfig:EndpointConfig){
	const bodyFields = endpointConfig.parameters.filter(x=> x.in ==='body');
	const array:Property[] =[];
	for(var index =0; index < bodyFields.length; index++){
		const field = bodyFields[index];
		if(field.schema !== undefined){
			const schema = field.schema as configSchema;
			const fieldDef = await getDefinitionPropertiesFromEndpoint(schema.$ref);
			if(fieldDef !== undefined){
				const properties:Property[] = (await getDefinitionArray(fieldDef?.properties));
				array.push.apply(array,properties);
			}
		}else{
			let fieldType;
			if(field.type === 'array' && field.items && field.items){
				const items:ArrayItemsObject = field.items as ArrayItemsObject;
				fieldType = items.type;
			}
			else{
				fieldType = field.type
			}

			array.push(
			  {
					"fieldName": field.name,
					"isArray": field.type === 'array',
					"objectDef": "",
					"fieldType": fieldType
				}
			)
		}

	}
	return array;
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
		if(filterConfig?.type ==='boolean'){
			qs[filters[index].field] = filters[index].value.toLocaleLowerCase() === 'true';
		}
		else {
			qs[filters[index].field] = filters[index].value;
		}
	}
	return qs
}

export async function getBody(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpointConfig:EndpointConfig,
	itemIndex:number
){
	const fieldProperties = await getEndpointFieldProperties(endpointConfig);
	const body:IDataObject = {};
	const fields = await this.getNodeParameter('fields.basicFields', itemIndex, []) as BasicField[];
	for(var index = 0;index<fields.length;index++){
		const field = fields[index];
		const fieldType = fieldProperties.find(x=>x.fieldName===field.field)?.fieldType ?? 'string';
		let fieldValue;
		if(fieldType === 'boolean'){
			fieldValue = field.value.toLocaleLowerCase() ==='true';
		}
		else if(fieldType === 'integer'){
			fieldValue = +field.value;
		}
		else{
			fieldValue = field.value
		}
		set(body,field.field,fieldValue);
		//body[field.field] = field.value;
	}
	return body;

}


export async function getDefinitionArray(properties:Property[]){
	const array:Property[] = [];
	if(properties !== undefined){
		for(var index= 0; index < properties.length; index++){
			const property = properties[index];
			if(property.objectDef===""){
				array.push(property);
			}
			else{
				const propertyDef = await getDefinitionPropertiesFromDef(property.objectDef,property.fieldName);
				if(propertyDef){
					array.push.apply(array,await getDefinitionArray(propertyDef));
				}
				else{
					array.push.apply(array,[{
						"fieldName": property.fieldName,
						"isArray":false,
						"objectDef":"",
						"fieldType":"string"
					}])
				}

			}
		}
	}
	return array as Property[];
}

export async function getDefinitionPropertiesFromDef(
	defObject:string,
	defObjectName:string
){
	const defName = defObject.split('/')[defObject.split('/').length-1];
	const definition = defintions.find(x=>x.name===defName);
	return definition?.properties.map((item)=>({
		"fieldName":defObjectName+'.'+item.fieldName,
		"isArray":item.isArray,
		"objectDef":item.objectDef,
		"fieldType":item.fieldType
	})) as Property[];
}

export async function getDefinitionPropertiesFromEndpoint(
	defObject:string
){
	const defName = defObject.split('/')[defObject.split('/').length-1];
	const definition = defintions.find(x=>x.name===defName);
	return definition;
}

export const toOptions = (items: LoadedResource[]) =>
	items.map(({ name, id }) => ({ name: name, value: id }));

export const arrayToOptions = (items: string[]) =>
	items.map((name) => ({ name: name, value: name }));
