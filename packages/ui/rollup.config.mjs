import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
    },
  ],
  plugins: [
    resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    commonjs(),
    babel({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      include: ['src/**/*'],
      babelHelpers: 'bundled',
    }),
    postcss({ extract: 'style.css', extensions: ['.css', '.scss', 'sass'] }),
  ],
  external: (id) => /node_modules/.test(id),
};
