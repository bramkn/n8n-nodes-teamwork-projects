import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TeamworkProjectsApi implements ICredentialType {
	name = 'teamworkProjectsApi';
	displayName = 'Teamwork Projects API';
	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'https://yoursite.eu.teamwork.com',
		},
		{
			displayName: 'Api Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
