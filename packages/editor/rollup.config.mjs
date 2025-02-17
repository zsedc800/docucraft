import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

const whitelist = ['material-ui-popup-state'];

const createBabelConfig = (targets) => ({
	babelHelpers: 'bundled',
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	include: ['src/**/*'],
	presets: [
		['@babel/preset-env', { targets }],
		['@babel/preset-typescript', {}]
	],
	exclude: 'node_modules/**'
});

const common = {
	input: 'src/index.ts',
	onwarn(warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') {
			console.warn('⚠️  Circular dependency detected:', warning);
		} else {
			warn(warning);
		}
	},
	external: (id) => {
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
		// visualizer({
		// 	filename: 'stats.html', // 生成分析报告
		// 	// open: true, // 自动打开浏览器
		// 	gzipSize: true, // 显示 gzip 之后的大小
		// 	brotliSize: true // 显示 brotli 之后的大小
		// }),
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

const esmConfig = {
	...common,

	output: {
		file: 'dist/index.mjs',
		format: 'esm',
		sourcemap: true
	},
	plugins: [
		...common.plugins
		// babel(createBabelConfig('defaults'))
	]
};

const cjsConfig = {
	...common,
	output: {
		file: 'dist/index.js',
		format: 'cjs',
		sourcemap: true,
		name: 'DocucraftEditor',
		exports: 'auto',
		interop: 'auto'
	},
	plugins: [
		...common.plugins,
		resolve({
			extensions: ['.js', '.jsx', '.ts', '.tsx'],
			mainFields: ['main'],
			exportConditions: ['require']
		})
		// babel(createBabelConfig({ browsers: ['last 2 versions', 'ie 11'] }))
	]
};

export default [esmConfig, cjsConfig];
