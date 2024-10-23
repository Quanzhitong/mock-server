const path = require('path');

const tsConfig = path.resolve(__dirname, 'tsconfig.json');

module.exports = {
  // 指定解析器
  parserOptions: {
    project: tsConfig,
    tsconfigRootDir: __dirname,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: tsConfig,
      },
    },
  },
  
};
