"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("../../model");
var column_1 = require("../../column");
var comment_1 = require("./comment");
var Post = /** @class */ (function (_super) {
    __extends(Post, _super);
    function Post() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Post.prototype.hasMany = function () {
        return [comment_1.Comment];
    };
    //todo: por defecto el tipo de columna deberia ser string (?)
    Post.columns = [
        new column_1.Column({ name: 'title', dbType: "varchar" /* STRING */ }),
        new column_1.Column({ name: 'content', dbType: "varchar" /* STRING */ }),
    ];
    return Post;
}(model_1.Model));
exports.Post = Post;
//# sourceMappingURL=post.js.map