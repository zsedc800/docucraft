module.exports = {
	presets: [
		[
			'@babel/env',
			{
				targets: {
					browsers: ['last 2 versions', 'ie 11']
				},
				modules: 'cjs'
			}
		],
		'@babel/preset-typescript'
	],
	plugins: [
		[
			'@babel/plugin-transform-react-jsx',
			{ runtime: 'automatic', importSource: '@docucraft/srender' }
		]
		// '@babel/plugin-transform-modules-commonjs'
	]
};
