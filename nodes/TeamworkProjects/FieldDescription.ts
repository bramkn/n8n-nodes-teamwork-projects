
import {
	INodeProperties,
} from 'n8n-workflow';


export const fieldOptions: INodeProperties[] =  [
	{
		displayName: 'Fields',
		name: 'fields',
		placeholder: 'Add Field',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		description: 'Field to add',
		default: {},
		options: [
			{
				name: 'basicFields',
				displayName: 'Basic Fields',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsDependsOn:['resource','operation'],
							loadOptionsMethod: 'getFields',
						},
						default: '',
						description: 'Key of the field to assign a value to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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
