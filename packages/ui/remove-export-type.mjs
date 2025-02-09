import path from 'path';
import ts from 'typescript';

class TypeResolver {
	constructor(tsconfigPath = 'tsconfig.json') {
		// 创建 TypeScript Program（解析整个项目）
		this.program = ts.createProgram({
			rootNames: this._getRootFiles(tsconfigPath),
			options: this._getCompilerOptions(tsconfigPath)
		});
		this.typeChecker = this.program.getTypeChecker();
	}

	_getRootFiles(tsconfigPath) {
		const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
		console.log(config, 'ccc');

		return config.config.files || [];
	}

	_getCompilerOptions(tsconfigPath) {
		const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
		return ts.parseJsonConfigFileContent(
			config.config,
			ts.sys,
			path.dirname(tsconfigPath)
		).options;
	}

	isTypeExport(filePath, exportName) {
		const sourceFile = this.program.getSourceFile(filePath);
		if (!sourceFile) return false;

		for (const statement of sourceFile.statements) {
			if (
				ts.isTypeAliasDeclaration(statement) ||
				ts.isInterfaceDeclaration(statement)
			) {
				if (statement.name.text === exportName) {
					return true;
				}
			}
		}
		return false;
	}
}
const typeResolver = new TypeResolver();

export default function () {
	return {
		visitor: {
			ExportNamedDeclaration(path, state) {
				// 获取当前文件路径
				const filename = state.filename || this.file.opts.filename;
				if (!filename) return;

				// 处理 `export { Foo, Bar } from "./fileA"`
				if (path.node.specifiers.length > 0) {
					path.node.specifiers = path.node.specifiers.filter((specifier) => {
						const exportName = specifier.exported.name;

						// 判断是否是 `type` 导出，如果是就移除
						const isType = typeResolver.isTypeExport(filename, exportName);
						return !isType;
					});

					// 如果 `export {}` 为空了，移除这个语句
					if (path.node.specifiers.length === 0) {
						path.remove();
					}
				}
			}
		}
	};
}
