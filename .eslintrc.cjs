module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        'plugin:vue/strongly-recommended',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'prettier',
    ],
    "overrides": [
    ],
    "parser": "vue-eslint-parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "parser": '@typescript-eslint/parser',
    },

    "plugins": ['vue', '@typescript-eslint', 'prettier'],
    "rules": {
    }
}
