const {
	Tapable,
	SyncWaterfallHook,
	SyncHook,
	SyncBailHook
} = require("tapable");

// require function shortcuts:
// __webpack_require__.s = the module id of the entry point
// __webpack_require__.c = the module cache
// __webpack_require__.m = the module functions
// __webpack_require__.p = the bundle public path
// __webpack_require__.i = the identity function used for harmony imports
// __webpack_require__.e = the chunk ensure function
// __webpack_require__.d = the exported property define getter function
// __webpack_require__.o = Object.prototype.hasOwnProperty.call
// __webpack_require__.r = define compatibility on export
// __webpack_require__.t = create a fake namespace object
// __webpack_require__.n = compatibility get default export
// __webpack_require__.h = the webpack hash
// __webpack_require__.w = an object containing all installed WebAssembly.Instance export objects keyed by module id
// __webpack_require__.oe = the uncaught error handler for the webpack runtime
// __webpack_require__.nc = the script nonce

module.exports = class MainTemplate extends Tapable {

	constructor(outputOptions) {
		super();
		this.outputOptions = outputOptions || {};
		this.hooks = {
		};
		this.requireFn = "__webpack_require__";
	}

};
