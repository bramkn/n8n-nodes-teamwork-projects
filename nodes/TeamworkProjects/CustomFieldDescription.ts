
import {
	INodeProperties,
} from 'n8n-workflow';


export const customFieldOptions: INodeProperties[] =  [
	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'string',
		default: '',
		description: 'Endpoint',
		displayOptions:{
			show:{
				resource:['v1ApiCustom']
			}
		},
	},
	{
		displayName: 'Method',
		name: 'method',
		type: 'options',
		options:[
			{
				name:'get',
				value:'get',
			},
			{
				name:'post',
				value:'post',
			},
			{
				name:'patch',
				value:'patch',
			},
			{
				name:'put',
				value:'put',
			},
			{
				name:'delete',
				value:'delete',
			},
		],
		default: 'post',
		description: 'Method',
		displayOptions:{
			show:{
				resource:['v1ApiCustom']
			}
		},
	},
	{
		displayName: 'Object',
		name: 'object',
		type: 'string',
		default: '',
		description: 'Object to Set',
		displayOptions:{
			show:{
				resource:['v1ApiCustom']
			}
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
		displayOptions:{
			show:{
				resource:['v1ApiCustom']
			}
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
						description: 'Field to assign a value to.',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options:[
							{
								name:'string',
								value:'string',
							},
							{
								name:'boolean',
								value:'boolean',
							},
							{
								name:'integer',
								value:'integer',
							},
						],
						default: '',
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
