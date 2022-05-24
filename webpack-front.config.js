const path = require('path')
module.exports = {
  target: "web",
  entry: {
    app: ["./src/frontend/main.js"]
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle-front.js",
  },
  mode: 'development',
}