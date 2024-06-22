import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

const createBabelConfig = (targets) => ({
	babelHelpers: 'bundled',
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	include: ['src/**/*'],
	presets: [['@babel/preset-env', { targets }]],
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
			rootDir: 'src'
		}),
		commonjs(),
		postcss({ extract: 'style.css', extensions: ['.css', '.scss', 'sass'] })
	]
};

const esmConfig = {
	...common,
	external: (id) => /node_modules/.test(id),
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
		sourcemap: true,
		name: 'DocucraftEditor'
	},
	plugins: [
		...common.plugins,
		babel(createBabelConfig({ browsers: ['last 2 versions', 'ie 11'] }))
	]
};

export default [esmConfig, cjsConfig];
