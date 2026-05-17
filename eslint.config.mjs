// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      
      // Template formatting
      'vue/html-indent': ['error', 2],
      'vue/html-closing-bracket-newline': ['error', { singleline: 'never', multiline: 'always' }],
      'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: 1 }],
      'vue/require-default-prop': 'off',
      
      // TypeScript rules
      '@typescript-eslint/no-unsafe-function-type': 'off'
    },
  }
)
