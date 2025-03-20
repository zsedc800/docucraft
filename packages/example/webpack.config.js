const HtmlWebpackPlugin = require('html-webpack-plugin');
const { setupWSConnection } = require('y-websocket/bin/utils');
const Websocket = require('ws');
const path = require('path');
module.exports = (env) => ({
	mode: env.production ? 'production' : 'development',
	entry: {
		main: './src/index.ts'
	},
	context: __dirname,
	devtool: 'source-map',
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
	devServer: {
		setupMiddlewares: (middlewares, devServer) => {
			const wss = new WebSocket.Server({ noServer: true });
			devServer.server.on('upgrade', (request, socket, head) => {
				const pathname = request.url;
				if (pathname === '/ws') {
					// 你的 WebSocket 路径
					wss.handleUpgrade(request, socket, head, (ws) => {
						setupWSConnection(ws, request, {
							gc: request.url.slice(1) !== 'prosemirror'
						});
					});
				}
			});
			return middlewares;
		}
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				enforce: 'pre', // 让 Webpack 在解析前处理 Source Map
				use: ['source-map-loader']
			},
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
