import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import path from 'path';

export default {
	input: 'src/index.ts',
	// watch: {
	// 	include: ['src/**/*'],
	// 	exclude: ['node_modules/**']
	// },
	output: {
		dir: 'dist',
		entryFileNames: '[name].mjs',
		format: 'esm',

		sourcemap: true
	},
	onerror(...args) {
		console.log(args, 'args');
	},
	onwarn(warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') {
			console.warn('⚠️  Circular dependency detected:', warning);
		} else {
			warn(warning);
		}
	},
	external: (id) => {
		// return /\@docucraft\/icons|\@codemirror/.test(id);
		return (
			/node_modules|\@docucraft\/icons\/styles/.test(id) &&
			!/react|@babel\/runtime|material|\@mui/.test(id)
		);
	},
	plugins: [
		alias({
			entries: [
				{ find: 'react', replacement: path.resolve('../srender') },
				{ find: 'react-dom', replacement: path.resolve('../srender') }
			]
		}),
		replace({ 'use client': '', preventAssignment: true }),

		typescript({
			tsconfig: './tsconfig.json'
		}),
		resolve({
			extensions: ['.js', '.jsx', '.ts', '.tsx']
		}),
		commonjs({
			defaultIsModuleExports: false, // 避免 CJS `module.exports` 直接变成 default
			transformMixedEsModules: true
		}),
		postcss({ extract: 'style.css', extensions: ['.css', '.scss', 'sass'] })
	]
};
