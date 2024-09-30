import path from 'path';
import fs from 'fs';
import { createFilter } from '@rollup/pluginutils';
import { parse } from '@babel/parser';
import { transformFromAstSync } from '@babel/core';
import traverse from '@babel/traverse';
import ts from 'typescript';

function resolveFile(id, importer, extensions) {
	const dir = importer ? path.dirname(importer) : '';
	if (!path.extname(id)) {
		if (fs.existsSync(path.resolve(dir, id))) id += '/index';
		for (const ext of extensions) {
			const p = path.resolve(dir, id + ext);
			if (fs.existsSync(p)) {
				id += ext;
				break;
			}
		}
	}
	return id;
}

function typescriptPlugin({
	inputDir = 'src',
	sourceMap = true,
	format = 'cjs'
} = {}) {
	const filter = createFilter(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']);
	const compiledFiles = new Map();
	const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css'];

	const tsCompilerOptions = {
		declaration: true, // 生成声明文件
		emitDeclarationOnly: true // 仅输出声明文件
	};
	const sourceFiles = [];
	return {
		name: 'typescript-plugin',

		buildStart(opts) {
			console.log('Build started');
		},

		resolveId(id, importer) {
			if (!importer) return null;

			id = resolveFile(id, importer, extensions);

			if (filter(id) || id.endsWith('.css')) {
				return path.resolve(path.dirname(importer), id);
			}
		},

		// async load(id) {
		// 	const code = fs.readFileSync(id, 'utf8');

		// 	return code;
		// },

		async transform(code, id) {
			if (filter(id)) {
				const ast = parse(code, {
					sourceType: 'module',
					plugins: ['jsx', 'typescript']
				});
				sourceFiles.push(id);
				const dependencies = [];
				const addDependency = (path) => {
					const source = path.node.source;
					if (source) dependencies.push(source.value);
				};
				traverse.default(ast, {
					ExportNamedDeclaration: addDependency,
					ExportAllDeclaration: addDependency,
					ImportDeclaration: addDependency
				});

				for (const dep of dependencies) {
					const resolved = await this.resolve(
						resolveFile(dep, id, extensions),
						id
					);

					if (resolved) {
						const id = resolved.id;

						this.addWatchFile(id);
						if (id.startsWith('/')) this.emitFile({ type: 'chunk', id });
					}
				}

				const opts = {
					presets: ['@babel/preset-typescript'],
					filename: id
					// plugins: [
					// 	({ types: t }) => ({
					// 		visitor: {
					// 			JSXElement(path) {
					// 				const commentText = `/*jsx ${path.getSource()}*/`;
					// 				const commentNode = t.expressionStatement(
					// 					t.stringLiteral(commentText)
					// 				);
					// 				path.skip();
					// 				path.replaceWith(commentNode);
					// 			}
					// 		}
					// 	})
					// ]
				};
				// const { code: jsCode } = transformFromAstSync(ast, code, opts);

				opts.plugins = [
					['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
				];
				opts.sourceMap = sourceMap;
				// const { code: jsCode } = transformFromAstSync(ast, code, opts)
				if (format === 'cjs')
					opts.plugins.push('@babel/plugin-transform-modules-commonjs');
				const res = transformFromAstSync(ast, code, opts);
				compiledFiles.set(id.replace(/\.ts(x)?/, '.js'), {
					code: res.code,
					map: res.map
				});

				return { code: '' };
			} else if (id.endsWith('.css')) {
				compiledFiles.set(id, { code: fs.readFileSync(id, 'utf-8') });
				return { code: '' };
			}
			return null;
		},

		generateBundle({ dir }, bundle) {
			const fileName = 'style.css';
			const style = {
				fileName,
				isAsset: false,
				type: 'chunk',
				code: ''
			};
			tsCompilerOptions.outDir = dir;

			for (let [k, { code, map }] of compiledFiles.entries()) {
				const id = path.relative(inputDir, k);

				const basename = path.basename(id);
				if (map) {
					code += `\n//# sourceMappingURL=${basename}.map`;
					bundle[id + '.map'] = {
						code: JSON.stringify(map),
						fileName: id + '.map',
						isAsset: false,
						type: 'chunk'
					};
				}
				bundle[id] = {
					fileName: id,
					isAsset: false,
					type: 'chunk',
					code
				};
				if (id.endsWith('.jsx')) {
					delete bundle[id.replace('.jsx', '.js')];
				}
				if (id.endsWith('.css')) style.code += code;
			}

			if (style.code) bundle[fileName] = style;
			const program = ts.createProgram(sourceFiles, tsCompilerOptions);
			program.emit();
		},

		buildEnd() {
			console.log('Build ended');
		}
	};
}

export default typescriptPlugin;
