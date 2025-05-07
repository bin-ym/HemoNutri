module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Use Expo's preset
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: './.env',
          safe: true,
          allowUndefined: false,
        },
      ],
    ],
  };
};