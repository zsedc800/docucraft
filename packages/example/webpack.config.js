const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		main: './src/index.ts'
	},
	resolve: {
		mainFiles: ['index'],
		extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx']
		// modules: [__dirname + 'node_modules', 'node_modules']
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
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.jsx']
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
};
