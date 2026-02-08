/**
 * ESLint Configuration — eluno
 * ESLint 9 flat config format
 *
 * Note: Most scripts use CommonJS (require), only validate-json.js uses ESM
 */

export default [
  // CommonJS scripts (legacy)
  {
    files: [
      'scripts/build-auto.cjs',
      'scripts/build-v2.cjs',
      'scripts/check-links.cjs',
      'scripts/generate-covers.cjs',
      'scripts/rename-audio-seo.cjs',
      'scripts/update-mp3-tags.cjs'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js CommonJS globals
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        // Browser globals (for Puppeteer scripts)
        document: 'readonly',
        window: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'warn'
    }
  },
  // ESM scripts (new)
  {
    files: ['scripts/validate-json.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all']
    }
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'archive/**', 'inbox/**']
  }
];
