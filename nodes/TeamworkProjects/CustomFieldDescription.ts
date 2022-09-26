
import { INodeProperties } from 'n8n-workflow';

export const customFieldOptions: INodeProperties[] = [
	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['v1ApiCustom'],
			},
		},
	},
	{
		displayName: 'Method',
		name: 'method',
		type: 'options',
		options: [
			{
				name: 'Delete',
				value: 'delete',
			},
			{
				name: 'Get',
				value: 'get',
			},
			{
				name: 'Patch',
				value: 'patch',
			},
			{
				name: 'Post',
				value: 'post',
			},
			{
				name: 'Put',
				value: 'put',
			},
		],
		default: 'post',
		displayOptions: {
			show: {
				resource: ['v1ApiCustom'],
			},
		},
	},
	{
		displayName: 'Object',
		name: 'object',
		type: 'string',
		default: '',
		description: 'Object to Set',
		displayOptions: {
			show: {
				resource: ['v1ApiCustom'],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'customFields',
		placeholder: 'Add Field',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		description: 'Field to add',
		default: {},
		displayOptions: {
			show: {
				resource: ['v1ApiCustom'],
			},
		},
		options: [
			{
				name: 'basicFields',
				displayName: 'Basic Fields',
				values: [
					{
						displayName: 'Field Name',
						name: 'field',
						type: 'string',
						default: '',
						description: 'Field to assign a value to',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{
								name: 'String',
								value: 'string',
							},
							{
								name: 'Boolean',
								value: 'boolean',
							},
							{
								name: 'Integer',
								value: 'integer',
							},
						],
						default: 'string',
						description: 'Value type',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value of the field',
					},
				],
			},
		],
	},
];