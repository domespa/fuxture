import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // I componenti di shadcn/ui esportano di proposito anche le varianti CVA
    // accanto al componente (buttonVariants, badgeVariants, useFormField):
    // e' la forma in cui vengono generati e in cui arrivano gli aggiornamenti
    // upstream. La regola di react-refresh segnalava ogni file come errore, e
    // spezzarli in due significherebbe divergere dal generatore a ogni
    // aggiunta di componente.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
