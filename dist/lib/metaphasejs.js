//todo: comentar funciones para que aparezcan en api doc
// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
export * from './orm/database';
export * from './orm/model';
export * from './orm/collection';
export * from './orm/column';
export * from './orm/decorators';
export * from './orm/exceptions';
export * from './orm/query.builder';
export * from './orm/yago.logger';
export var DBtype;
(function (DBtype) {
    DBtype["INTEGER"] = "integer";
    DBtype["REAL"] = "real";
    DBtype["BOOLEAN"] = "integer";
    DBtype["STRING"] = "varchar";
    DBtype["TEXT"] = "text";
    DBtype["DATE"] = "varchar";
    DBtype["BLOB"] = "blob";
    DBtype["NULL"] = "null"; // null is reserved word
})(DBtype || (DBtype = {}));
//# sourceMappingURL=metaphasejs.js.map