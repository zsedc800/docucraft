module.exports = {
	presets: [
		[
			'@babel/env',
			{
				targets: {
					browsers: ['last 2 versions', 'ie 11']
				}
				// modules: 'cjs'
			}
		],
		['@babel/preset-typescript']
	],
	plugins: [
		[
			'@babel/plugin-transform-react-jsx',
			{ runtime: 'automatic', importSource: '@docucraft/srender' }
		]
		// ['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
		// ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
		// ['@babel/plugin-proposal-class-properties', { loose: true }]
		// ['@babel/plugin-transform-private-methods', { loose: true }]
		// '@babel/plugin-transform-modules-commonjs'
	]
};
