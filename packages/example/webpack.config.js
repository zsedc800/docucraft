const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = (env) => ({
	mode: env.production ? 'production' : 'development',
	entry: {
		main: './src/index.ts'
	},
	context: __dirname,
	resolve: {
		// mainFiles: ['index'],
		// mainFields: ['browser', 'module', 'main'],
		// mainFields: ['main'],
		// conditionNames: ['require'],
		extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
		alias: {
			react: '@docucraft/srender',
			'react-dom': '@docucraft/srender',
			'react/jsx-runtime': '@docucraft/srender/jsx-runtime'
		},
		// modules: [
		// 	'node_modules',
		// 	'/root/workspace/docucraft/node_modules/.pnpm/next@14.2.3_@babel+core@7.24.7_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.77.2/node_modules/next/dist/bin/node_modules',
		// 	'/root/workspace/docucraft/node_modules/.pnpm/next@14.2.3_@babel+core@7.24.7_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.77.2/node_modules/next/dist/node_modules',
		// 	'/root/workspace/docucraft/node_modules/.pnpm/next@14.2.3_@babel+core@7.24.7_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.77.2/node_modules/next/node_modules',
		// 	'/root/workspace/docucraft/node_modules/.pnpm/next@14.2.3_@babel+core@7.24.7_react-dom@18.3.1_react@18.3.1__react@18.3.1_sass@1.77.2/node_modules',
		// 	'/root/workspace/docucraft/node_modules/.pnpm/node_modules'
		// ]
		modules: [
			'node_modules',
			'/home/zsedc800/workspace/docucraft/node_modules/.pnpm/node_modules'
		]
		// modules: [
		// 	'/root/workspace/docucraft/node_modules/.pnpm/node_modules',
		// 	path.resolve(__dirname, 'node_modules'),
		// 	'node_modules'
		// ] // 模块解析以当前项目为基准
	},
	module: {
		rules: [
			{
				test: /\.(t|j)sx?$/,
				use: 'babel-loader'
			},
			{
				test: /\.s?css/,
				use: ['style-loader', 'css-loader', 'postcss-loader']
			},
			{
				test: /\.(ttf|woff2?)/,
				type: 'asset/resource',
				generator: {
					filename: 'fonts/[hash][ext][query]'
				}
			}
		]
	},
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
		filename: '[name].[contenthash:9].js',
		chunkFilename: 'chunk/[name].js'
	},
	devServer: {
		port: 3200,
		host: '0.0.0.0',
		client: {
			overlay: false
		},
		static: {
			directory: path.join(__dirname, 'public')
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'example',
			template: './public/index.html',
			filename: 'index.html',
			inject: true
		})
	]
});
