
export type TeamworkProjectsApiCredentials = {
	host:string;
	apiToken: string;
}

export type LoadedResource = {
	id: number;
	name: string;
}


export type FieldsUiValues = Array<{
	fieldId: string;
	fieldValue: string;
}>;

export type EndpointConfig = {
	endpoint:string,
	method:string,
	parameters: Object[],
	description:string,
	group:string,
}
