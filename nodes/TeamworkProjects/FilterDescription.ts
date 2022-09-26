
import {
	INodeProperties,
} from 'n8n-workflow';


export const filterOptions: INodeProperties[] =  [
	{
		displayName: 'Filter Parameters',
		name: 'parameters',
		placeholder: 'Add Parameter',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		description: 'Filter paramaters to apply',
		default: {},
		displayOptions:{
			hide:{
				resource:['v1ApiCustom'],
			},
		},
		options: [
			{
				name: 'basicFilter',
				displayName: 'Basic Filter',
				values: [
					{
						displayName: 'Filter',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsDependsOn:['resource','operation'],
							loadOptionsMethod: 'getFilterFields',
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
