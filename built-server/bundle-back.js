/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/backend/clientConnection.js":
/*!*****************************************!*\
  !*** ./src/backend/clientConnection.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"clientConnection\": () => (/* binding */ clientConnection)\n/* harmony export */ });\n/* harmony import */ var _gameCommunication__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameCommunication */ \"./src/backend/gameCommunication.js\");\n\r\n\r\nfunction clientConnection(io) {\r\n  let currentPlayers = {}; // to store player data\r\n\r\n  // when a new player connects\r\n  io.on(\"connection\", function (socket) {\r\n    (0,_gameCommunication__WEBPACK_IMPORTED_MODULE_0__.gameCommunication)(socket, currentPlayers);\r\n\r\n    socket.on(\"disconnect\", function () {\r\n      // remove this player from currentPlayers\r\n      delete currentPlayers[socket.id];\r\n      // emit a message to all players to remove this player\r\n      io.emit(\"remove player\", socket.id);\r\n    });\r\n  });\r\n\r\n  // every 10 seconds send a message with count of players\r\n  setInterval(() => {\r\n    const time = new Date();\r\n    console.log(\r\n      Object.keys(currentPlayers).length +\r\n        \" logged in @ \" +\r\n        time.toLocaleString(\"es-ES\", {\r\n          timeZone: \"Europe/Madrid\",\r\n          hourCycle: \"h23\",\r\n          hour: \"numeric\",\r\n          minute: \"numeric\",\r\n        })\r\n    );\r\n  }, 10000);\r\n}\r\n\n\n//# sourceURL=webpack://goldenthieves/./src/backend/clientConnection.js?");

/***/ }),

/***/ "./src/backend/gameCommunication.js":
/*!******************************************!*\
  !*** ./src/backend/gameCommunication.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"gameCommunication\": () => (/* binding */ gameCommunication)\n/* harmony export */ });\nfunction gameCommunication(socket, currentPlayers) {\r\n  //when the scene is ready\r\n  socket.on(\"ready\", () => {\r\n    // create a new player and add it to currentPlayers\r\n    let newPlayer = createNewPlayer(currentPlayers, socket);\r\n    socket.emit(\"greeting\", currentPlayers);\r\n    socket.broadcast.emit(\"new player\", socket.id, newPlayer);\r\n  });\r\n\r\n  // when a player moves, update the player data\r\n  socket.on(\"player movement\", function (data) {\r\n    currentPlayers[socket.id].x = data.x;\r\n    currentPlayers[socket.id].y = data.y;\r\n    currentPlayers[socket.id].keydown = data.keydown;\r\n    // emit a message to all players about the player that moved\r\n    socket.broadcast.emit(\"player moved\", currentPlayers[socket.id]);\r\n  });\r\n\r\n  // when a player mines, play animation\r\n  socket.on(\"player mining\", function () {\r\n    socket.broadcast.emit(\"player mined\", currentPlayers[socket.id]);\r\n  });\r\n\r\n  // when a player stops mining, stop animation\r\n  socket.on(\"player stop mining\", function () {\r\n    socket.broadcast.emit(\"player mine stopped\", currentPlayers[socket.id]);\r\n  });\r\n\r\n  /**\r\n   * @function createNewPlayer\r\n   * @description Creates a new player\r\n   * @param {*} socket - the socket connection\r\n   */\r\n  function createNewPlayer(currentPlayers, socket) {\r\n    return currentPlayers[socket.id] = {\r\n      socketId: socket.id,\r\n      loginTime: new Date().getTime(),\r\n      x: 600 + Math.random() * 600,\r\n      y: 600 + Math.random() * 600,\r\n      keydown: \"idle\",\r\n    };\r\n  }\r\n}\n\n//# sourceURL=webpack://goldenthieves/./src/backend/gameCommunication.js?");

/***/ }),

/***/ "./src/backend/server.js":
/*!*******************************!*\
  !*** ./src/backend/server.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! http */ \"http\");\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(http__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _clientConnection__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./clientConnection */ \"./src/backend/clientConnection.js\");\n\r\n\r\n\r\n\r\n\r\n\r\nconst app = express__WEBPACK_IMPORTED_MODULE_2___default()();\r\nconst port = process.env.PORT ?? 3000;\r\nconst server = http__WEBPACK_IMPORTED_MODULE_1___default().createServer(app);  \r\nconst io = __webpack_require__(/*! socket.io */ \"socket.io\")(server);\r\n\r\n// set up routes\r\napp.use(express__WEBPACK_IMPORTED_MODULE_2___default()[\"static\"]('/../public')); \r\napp.get(\"/\", (req, res) =>{\r\n    res.sendFile(path__WEBPACK_IMPORTED_MODULE_0___default().join(__dirname,\"/../public/index.html\"))\r\n})\r\napp.get(\"/style.css\", (req, res) =>{\r\n    res.sendFile(path__WEBPACK_IMPORTED_MODULE_0___default().join(__dirname,\"/../public/style.css\"))\r\n})\r\napp.get(\"/bundle-front.js\", (req, res) =>{\r\n    res.sendFile(path__WEBPACK_IMPORTED_MODULE_0___default().join(__dirname,\"/../public/bundle-front.js\"))\r\n})\r\napp.get(\"/assets/*\", (req, res) =>{\r\n    res.sendFile(path__WEBPACK_IMPORTED_MODULE_0___default().join(__dirname,\"/../public/\"+req.path))\r\n})\r\napp.get(\"/tiled/*\", (req, res) =>{\r\n    res.sendFile(path__WEBPACK_IMPORTED_MODULE_0___default().join(__dirname,\"/../public/\"+req.path))\r\n})\r\napp.get(\"/fonts/*\", (req, res) =>{\r\n    res.sendFile(path__WEBPACK_IMPORTED_MODULE_0___default().join(__dirname,\"/../public/\"+req.path))\r\n})\r\n\r\n// start game communication server (socket.io)\r\n;(0,_clientConnection__WEBPACK_IMPORTED_MODULE_3__.clientConnection)(io);\r\n\r\n// start server\r\n  server.listen(port, () => {\r\n    console.log(`[server]: Server is running at http://localhost:${port}`);\r\n });\r\n\n\n//# sourceURL=webpack://goldenthieves/./src/backend/server.js?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/backend/server.js");
/******/ 	
/******/ })()
;