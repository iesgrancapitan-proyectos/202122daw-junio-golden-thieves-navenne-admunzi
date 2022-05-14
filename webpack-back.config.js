const path = require('path')
const nodeExternals = require('webpack-node-externals')
module.exports = {
  target: "node",
  entry: {
    app: ["./src/backend/server.js"]
  },
  output: {
    path: path.resolve(__dirname, "built-server"),
    filename: "bundle-back.js"
  },
  externals: [nodeExternals()],
  mode: "production"
};