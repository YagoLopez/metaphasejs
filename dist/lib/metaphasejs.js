"use strict";
// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
// import {User} from "./models/user";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// export class DummyClass {
//   constructor() {
//     const user1 = new User({name: 'user1', age: 10, admin: 0});
//     console.error('user1', user1);
//   }
// }
__export(require("./orm/database"));
__export(require("./orm/model"));
__export(require("./orm/collection"));
__export(require("./orm/column"));
__export(require("./orm/decorators"));
__export(require("./orm/exceptions"));
__export(require("./orm/query.builder"));
__export(require("./orm/types"));
__export(require("./orm/yago.logger"));
// export namespace HelloWorld {
//   export function sayHello() {
//     console.log('hi')
//   }
//   export function sayGoodbye() {
//     console.log('goodbye')
//   }
// }
//# sourceMappingURL=metaphasejs.js.map