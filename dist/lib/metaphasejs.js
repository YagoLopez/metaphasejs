"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
//todo: comentar funciones para que aparezcan en api doc
// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
__export(require("./orm/database"));
__export(require("./orm/model"));
__export(require("./orm/collection"));
__export(require("./orm/column"));
__export(require("./orm/decorators"));
__export(require("./orm/exceptions"));
__export(require("./orm/query.builder"));
__export(require("./orm/yago.logger"));
var DBtype;
(function (DBtype) {
    DBtype["INTEGER"] = "integer";
    DBtype["REAL"] = "real";
    DBtype["BOOLEAN"] = "integer";
    DBtype["STRING"] = "varchar";
    DBtype["TEXT"] = "text";
    DBtype["DATE"] = "varchar";
    DBtype["BLOB"] = "blob";
    DBtype["NULL"] = "null"; // null is reserved word
})(DBtype = exports.DBtype || (exports.DBtype = {}));
//# sourceMappingURL=metaphasejs.js.map