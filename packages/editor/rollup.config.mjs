import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import path from 'path';

const whitelist = ['material-ui-popup-state'];

const createBabelConfig = (targets) => ({
	babelHelpers: 'bundled',
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	include: ['src/**/*'],
	presets: [['@babel/preset-env', { targets }]],
	exclude: 'node_modules/**'
});

const common = {
	input: 'src/index.ts',
	external: (id) => {
		return (
			/node_modules|\@docucraft\/icons\/styles/.test(id) &&
			!/react|material|\@mui/.test(id)
		);
	},
	plugins: [
		alias({
			entries: [
				{ find: 'react', replacement: path.resolve('../srender') },
				{ find: 'react-dom', replacement: path.resolve('../srender') }
			]
		}),
		resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
		// typescript({
		// 	tsconfig: './tsconfig.json'
		// }),
		commonjs(),
		postcss({ extract: 'style.css', extensions: ['.css', '.scss', 'sass'] })
	]
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
		sourcemap: true,
		name: 'DocucraftEditor'
	},
	plugins: [
		...common.plugins,
		babel(createBabelConfig({ browsers: ['last 2 versions', 'ie 11'] }))
	]
};

export default [esmConfig, cjsConfig];
