
module.exports = products = {
	'pantene': {
		categories: ['shampoo', 'conditioner', 'body wash', 'body lotion'],
		inStock: true
	},
	'dove': {
		categories: ['shampoo', 'conditioner', 'body wash', 'body lotion'],
		inStock: true
	},
	'axe': {
		categories: ['shampoo', 'conditioner', 'body wash'],
		inStock: true
	},

	'nike' : {
		categories: ['socks', 'shoes'],
		inStock: true
	},
	'levi' : {
		categories: ['jeans'],
		inStock: true
	},
	'hanes' : {
		categories: ['shirt', 'socks'],
		inStock: true
	},

	'sony' : {
		categories: ['tv', 'speakers', 'computer'],
		inStock: {
			'tv': false,
			'speaker': true,
			'computer': true,
		}
	},
	'samsung': {
		categories: ['tv', 'cellphone'],
		inStock: true
	},
	'apple' : {
		categories: ['cellphone', 'computer'],
		inStock: true
	},
	
	'purina': {
		categories: ['cat food', 'dog food', 'cat litter'],
		inStock: true
	},
	'tetra': {
		categories: ['fish food'],
		inStock: true
	},

	'rachael ray': {
		categories: ['cat food', 'dog food', 'dish', 'cup', 'pan', 'knives'],
		inStock: true
	},
	
	'organic valley': {
		catergoies: ['milk'],
		inStock: true,
	},

	'cuties': {
		categories: ['fruits'],
		inStock: true,
	},

	'lean cuisine': {
		categories: ['frozen food'],
		inStock: true
	},

	'wonder bread': {
		categories: ['bread'],
		inStock: true
	}
}