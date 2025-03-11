import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { visualizer } from 'rollup-plugin-visualizer';

const isDev = process.env.NODE_ENV === 'development';

const common = {
	input: 'src/index.ts',
	onwarn(warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') {
			console.warn('⚠️  Circular dependency detected:', warning);
		} else {
			warn(warning);
		}
	},
	plugins: [
		// visualizer({
		// 	filename: 'stats.html', // 生成分析报告
		// 	// open: true, // 自动打开浏览器
		// 	gzipSize: true, // 显示 gzip 之后的大小
		// 	brotliSize: true // 显示 brotli 之后的大小
		// }),

		typescript({
			tsconfig: './tsconfig.json'
		}),
		resolve({
			extensions: ['.js', '.jsx', '.ts', '.tsx']
		}),
		commonjs({
			defaultIsModuleExports: false, // 避免 CJS `module.exports` 直接变成 default
			transformMixedEsModules: true
		})
	]
};

const esmConfig = {
	...common,

	output: {
		dir: 'dist',
		entryFileNames: '[name].mjs',
		format: 'esm',

		sourcemap: true
	},
	plugins: [...common.plugins]
};

const cjsConfig = {
	...common,
	output: {
		dir: 'dist',
		entryFileNames: '[name].js',
		format: 'cjs',
		sourcemap: true,
		name: 'DocucraftMindMap',
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
	]
};

export default isDev ? esmConfig : [esmConfig, cjsConfig];
