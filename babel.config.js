module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@api': './src/api',
          '@auth': './src/auth',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@notifications': './src/notifications',
          '@screens': './src/screens',
          '@store': './src/store',
          '@models': './src/types',
          '@utils': './src/utils'
        }
      }
    ]
  ]
};