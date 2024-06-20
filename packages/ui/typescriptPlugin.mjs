import path from 'path';
import fs from 'fs';
import { createFilter } from '@rollup/pluginutils';
import { parse } from '@babel/parser';
import { transformFromAstSync } from '@babel/core';

function typescriptPlugin({ inputDir = 'src', sourceMap = true } = {}) {
	const filter = createFilter(['**/*.ts', '**/*.tsx']);
	const compiledFiles = new Map();
	return {
		name: 'typescript-plugin',

		buildStart() {
			console.log('Build started');
		},

		resolveId(id, importer) {
			if (importer && (filter(id) || id.endsWith('.css'))) {
				return path.resolve(path.dirname(importer), id);
			}
			return null;
		},

		load(id) {
			if (filter(id)) {
				return fs.readFileSync(id, 'utf8');
			}
			return null;
		},

		transform(code, id) {
			if (filter(id)) {
				const ast = parse(code, {
					sourceType: 'module',
					plugins: ['jsx', 'typescript']
				});
				const opts = {
					presets: ['@babel/preset-typescript'],
					filename: id,
					plugins: [
						({ types: t }) => ({
							visitor: {
								JSXElement(path) {
									const commentText = `/*jsx ${path.getSource()}*/`;
									const commentNode = t.expressionStatement(
										t.stringLiteral(commentText)
									);
									path.skip();
									path.replaceWith(commentNode);
								}
							}
						})
					]
				};
				const { code: jsCode } = transformFromAstSync(ast, code, opts);
				opts.plugins = ['@babel/plugin-transform-modules-commonjs'];
				opts.sourceMap = sourceMap;
				const res = transformFromAstSync(ast, code, opts);
				compiledFiles.set(id.replace(/\.ts(x)?/, '.js$1'), {
					code: res.code,
					map: res.map
				});
				return {
					code: jsCode,
					map: null
				};
			} else if (id.endsWith('.css')) {
				compiledFiles.set(id, { code: fs.readFileSync(id, 'utf-8') });
			}
			return null;
		},

		generateBundle(outputOptions, bundle) {
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
			}
		},

		buildEnd() {
			console.log('Build ended');
		}
	};
}

export default typescriptPlugin;
