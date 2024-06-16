import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve';

const createBabelConfig = (targets) => ({
	babelHelpers: 'bundled',
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	include: ['src/**/*'],
	presets: [
		['@babel/preset-env', { targets }],
		'@babel/preset-typescript',
		'@babel/preset-react'
	],
	plugins: [
		[
			'@babel/plugin-transform-react-jsx',
			{ runtime: 'automatic', importSource: '@docucraft/srender' }
		]
	],
	exclude: 'node_modules/**'
});

const common = {
	input: 'src/index.ts',
	plugins: [
		resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
		typescript({
			tsconfig: './tsconfig.json',
			declaration: true,
			declarationDir: 'dist',
			rootDir: './'
		}),
		commonjs(),
		postcss({ extract: 'style.css', extensions: ['.css', '.scss', 'sass'] }),
		serve({
			open: true,
			contentBase: ['dist', 'public'],
			port: 3011,
			host: '0.0.0.0'
		})
	],
	external: (id) => /node_modules/.test(id)
};

const esmConfig = {
	...common,
	output: {
		file: 'dist/index.mjs',
		format: 'esm',
		sourcemap: true
	},
	plugins: [...common.plugins, babel(createBabelConfig('defaults'))]
};

const cjsConfig = {
	...common,
	output: {
		file: 'dist/index.js',
		format: 'umd',
		name: 'dUI',
		sourcemap: true
	},
	plugins: [
		...common.plugins,
		babel(createBabelConfig({ browsers: ['last 2 versions', 'ie 11'] }))
	]
};

export default [esmConfig, cjsConfig];
