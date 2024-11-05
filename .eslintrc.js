module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // Используем современный стандарт ECMAScript
    sourceType: 'module', // Разрешаем использовать ES-модули
  },
  env: {
    node: true,
    es6: true,
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Правила для TypeScript
    'plugin:import/errors',                  // Проверка импортов
    'plugin:import/warnings',
    'plugin:import/typescript',              // Поддержка импортов для TypeScript
    'prettier',                              // Отключение конфликтующих правил с Prettier
  ],
  rules: {
    // Основные правила TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Отключить требование явного типа возвращаемых значений
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Предупреждение о неиспользуемых переменных, игнорируя с "_"
    '@typescript-eslint/no-explicit-any': 'warn', // Избегать "any", но только как предупреждение

    // Импорты
    'import/order': ['warn', { // Упорядочение импортов
      'newlines-between': 'always',
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    }],
    'import/no-unresolved': 'error', // Ошибка для неразрешенных импортов
    'import/no-duplicates': 'warn', // Предупреждение для дублированных импортов

    // Лучшие практики
    'eqeqeq': 'warn', // Использовать === вместо ==
    'no-console': 'warn', // Разрешить console, но только с предупреждением
    'no-debugger': 'warn', // Разрешить debugger только с предупреждением

    // Стиль кода
    'quotes': ['warn', 'single', { avoidEscape: true }], // Использовать одинарные кавычки
    'semi': ['warn', 'always'], // Всегда ставить точку с запятой
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  ignorePatterns: [
    'dist',       // Игнорируем папку сборки
    'node_modules', // Игнорируем зависимости
  ],
};
