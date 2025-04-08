import { Options, defineConfig } from 'tsup';

export default defineConfig((options: Options) => ({
  // treeshake: true,
  // splitting: true,
  entry: {
    index: './src/index.ts',
  },
  target: 'es6',
  format: ['esm'],
  dts: true,
  minify: true,
  clean: false,
  external: ['react', 'react-dom', '@mui/material', '@mui/icons-material'],
  ...options,
}));
