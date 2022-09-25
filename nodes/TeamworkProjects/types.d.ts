
export type TeamworkProjectsApiCredentials = {
	host:string;
	apiToken: string;
}

export type LoadedResource = {
	id: number;
	name: string;
}
export type optionsFromConfig ={
	name:string,
	value:string,
	description?:string
}


export type FieldsUiValues = Array<{
	fieldId: string;
	fieldValue: string;
}>;

export type EndpointConfig = {
	endpoint:string,
	method:string,
	parameters: EndpointParameter[],
	description:string,
	group:string,
}

export type EndpointParameter = {
	in:string,
	name:string,
	required?:boolean,
	schema?:Object,
	type:string,
	description?:string,
	enum?:string[],
	items?:Object,
}

export type BasicFilter = {
	field: string;
	value: string;
};
