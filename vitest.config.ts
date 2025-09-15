import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      // Cible uniquement le code source pour la couverture
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        // Exclusions explicites
        'vitest.config.ts',
        'src/types.ts',
        'src/index.ts',
        'src/managers/index.ts'
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
      enabled: true,
      clean: true,
      reportsDirectory: './coverage'
    }
  }
})
