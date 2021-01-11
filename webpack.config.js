const path = require('path');

module.exports = {
    entry: {
        login: './src/login.mjs',
        workspace: '/src/workspace.mjs'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'presalytics_workspace', 'static', 'js'),
    },
    devtool: 'eval-source-map'
}