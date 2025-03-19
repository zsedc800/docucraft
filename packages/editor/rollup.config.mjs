import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

const common = {
	input: 'src/index.ts',
	watch: {
		include: ['src/**/*'],
		exclude: ['node_modules/**']
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
		// visualizer({
		// 	filename: 'stats.html', // 生成分析报告
		// 	// open: true, // 自动打开浏览器
		// 	gzipSize: true, // 显示 gzip 之后的大小
		// 	brotliSize: true // 显示 brotli 之后的大小
		// }),
		replace({ 'use client': '', preventAssignment: true }),

		typescript({
			tsconfig: './tsconfig.json',
			declaration: true,
			declarationDir: 'dist',
			rootDir: 'src'
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
		dir: 'dist',
		entryFileNames: '[name].mjs',
		format: 'esm',
		chunkNames: '[name]',
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
		dir: 'dist',
		entryFileNames: '[name].js',
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

export default isDev ? esmConfig : [esmConfig, cjsConfig];
