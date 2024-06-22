const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = (env) => ({
	mode: env.production ? 'production' : 'development',
	entry: {
		main: './src/index.ts'
	},

	resolve: {
		mainFiles: ['index'],
		extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
		alias: {
			react: '@docucraft/srender',
			'react-dom': '@docucraft/srender'
		}
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
		filename: '[name].[contenthash:9].js'
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
