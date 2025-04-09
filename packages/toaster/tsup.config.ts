import { Options, defineConfig } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: {
    index: './src/index.ts',
    // declarations: './src/themeDeclarations.d.ts',
  },
  target: 'es6',
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  clean: false,
  external: ['react', 'react-dom', '@mui/material', '@mui/icons-material'],
  ...options,
}));
