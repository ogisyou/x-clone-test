module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    '@babel/plugin-syntax-import-attributes'
  ]
};