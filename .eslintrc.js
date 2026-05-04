module.exports = {
    root: true,
    env: {
        es2021: true,
    },
    overrides: [
        {
        files: ["backend/**/*.js"],
        env: {
            node: true,
            commonjs: true,
        },
        extends: ["eslint:recommended"],
        parserOptions: {
            ecmaVersion: 2021,
        },
        rules: {
            "no-console": "off",
        },
        },
        {
        files: ["frontend/**/*.jsx", "frontend/**/*.js"],
        env: {
            browser: true,
            es2021: true,
        },
        extends: ["eslint:recommended", "plugin:react/recommended"],
        settings: {
            react: {
            version: "detect",
            },
        },
        parserOptions: {
            ecmaFeatures: {
            jsx: true,
            },
            ecmaVersion: 2021,
            sourceType: "module",
        },
        rules: {
            "react/react-in-jsx-scope": "off",
        },
        },
    ],
};
