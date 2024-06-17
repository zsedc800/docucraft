module.exports = {
	presets: ['@babel/env', '@babel/preset-typescript'],
	plugins: [
		[
			'@babel/plugin-transform-react-jsx',
			{ runtime: 'automatic', importSource: '@docucraft/srender' }
		]
	]
};
