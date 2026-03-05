import type { FlatXoConfig } from 'xo';

export default [
	{
		ignores: [
			'dist',
			'node_modules',
			'coverage',
			'build',
			'docs',
			'examples',
			'scripts',
			'tests',
			'xo.config.ts',
		],
	},
	{
		prettier: true,
		rules: {
			"@typescript-eslint/no-restricted-types": "off"
		}
	},
] satisfies FlatXoConfig;
