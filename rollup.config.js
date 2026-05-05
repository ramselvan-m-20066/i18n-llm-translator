import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default [
    // ESM build
    {
        input: 'src/index.js',
        output: {
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        },
        external: Object.keys(pkg.dependencies || {}),
        plugins: [
            resolve(),
            commonjs(),
            json()
        ]
    },
    // CommonJS build
    {
        input: 'src/index.js',
        output: {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        },
        external: Object.keys(pkg.dependencies || {}),
        plugins: [
            resolve(),
            commonjs(),
            json()
        ]
    },
    // CLI build
    {
        input: 'src/cli.js',
        output: {
            file: 'dist/cli.js',
            format: 'esm',
            sourcemap: true,
            banner: '#!/usr/bin/env node'
        },
        external: Object.keys(pkg.dependencies || {}),
        plugins: [
            resolve(),
            commonjs(),
            json()
            // Removed terser to avoid issues with private fields
        ]
    }
];