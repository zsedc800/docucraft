import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
// import typescript from './typescript.mjs';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
// import typescriptPlugin from './typescriptPlugin.mjs';

// const createBabelConfig = (targets) => ({
// 	babelHelpers: 'bundled',
// 	extensions: ['.js', '.jsx', '.ts', '.tsx'],
// 	include: ['src/**/*'],
// 	presets: [['@babel/preset-env', { targets }], ['@babel/preset-typescript']],
// 	plugins: ['@babel/plugin-transform-react-jsx'],
// 	exclude: 'node_modules/**'
// });

const common = {
	input: 'src/index.ts',
	external: (id) => /node_modules|\@docucraft|\.(sass|less|css|scss)$/.test(id)
};
const plugins = [
	resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'] }),
	typescript({
		tsconfig: './tsconfig.json'
	}),
	commonjs({
		defaultIsModuleExports: false, // 避免 CJS `module.exports` 直接变成 default
		transformMixedEsModules: true
	}),
	postcss({ extract: 'style.css', extensions: ['.css', '.scss', 'sass'] }),
	copy({
		targets: [
			{ src: 'src/**/*.css', dest: 'dist' },
			{ src: 'src/**/*.scss', dest: 'dist' },
			{ src: 'src/**/*.css', dest: 'es' },
			{ src: 'src/**/*.scss', dest: 'es' }
		],
		flatten: false // 保持原有目录结构
	})
];

const cjsConfig = {
	...common,
	output: {
		dir: 'dist',
		format: 'cjs',
		preserveModules: true,
		preserveModulesRoot: 'src', // 使输出目录层级与 src 对应
		entryFileNames: '[name].js' // 统一输出的文件后缀
	},
	plugins: [
		...plugins
		// babel(createBabelConfig({ browsers: ['last 2 versions', 'ie 11'] }))
	]
	// plugins: [typescriptPlugin()]
};

const esmConfig = {
	...common,
	output: {
		dir: 'es',
		format: 'esm',
		preserveModules: true,
		preserveModulesRoot: 'src', // 使输出目录层级与 src 对应
		entryFileNames: '[name].js' // 统一输出的文件后缀
	},
	plugins: [
		...plugins
		// babel(createBabelConfig('defaults'))
	]
	// plugins: [typescriptPlugin({ format: 'esm' })]
};

export default [cjsConfig, esmConfig];
