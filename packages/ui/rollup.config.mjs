import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import typescriptPlugin from './typescriptPlugin.mjs';

const common = {
	input: 'src/index.ts',
	plugins: [
		resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
		typescript({
			tsconfig: './tsconfig.json'
		}),
		commonjs({
			include: 'node_modules/**'
		}),
		postcss({ extract: 'style.css', extensions: ['.css', '.scss', 'sass'] })
	],
	external: (id) => /node_modules/.test(id) || /\@docucraft/.test(id)
};

const cjsConfig = {
	...common,
	output: {
		dir: 'dist',
		format: 'cjs',
		preserveModules: true
	},
	plugins: [...common.plugins, typescriptPlugin()]
};

export default [cjsConfig];
