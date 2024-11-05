import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: ['src/index.ts'],
  output: [
    {
      dir: 'dist',
      format: 'es',
      entryFileNames: '[name].esm.js',
      preserveModules: true,  // Сохраняет структуру папок для tree-shaking
      sourcemap: true
    },
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
      preserveModules: true,
      sourcemap: true
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      clean: true
    }),
    terser()  // Опционально для минификации
  ]
};