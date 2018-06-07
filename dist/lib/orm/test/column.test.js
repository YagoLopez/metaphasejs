"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collection_1 = require("../collection");
var column_1 = require("../column");
var user_1 = require("./models/user");
var post_1 = require("./models/post");
var users = new collection_1.Collection(user_1.User);
var user1 = new user_1.User({ name: "user1", age: 11, admin: 0 });
var user2 = new user_1.User({ name: "user2", age: 22, admin: 1 });
var user3 = new user_1.User({ name: "user3", age: 33, admin: 1 });
user1.save();
user2.save();
user3.save();
describe('Column Class', function () {
    test('constructor()', function () {
        // The new column to test must be created before collection instantiation
        var newColumn = new column_1.Column({ name: 'newColumn', dbType: "varchar" /* STRING */ });
        post_1.Post.columns.push(newColumn);
        var posts = new collection_1.Collection(post_1.Post);
        expect(post_1.Post.columns[3].name).toBe('newColumn');
        expect(collection_1.Collection.hasColumn('posts', 'newColumn')).toBeTruthy();
    });
    test('createColumnsRelation()', function () {
        var tableSchema = collection_1.Collection.getTableSchema(post_1.Post);
        expect(post_1.Post.columns[2].name).toBe('user_id');
        expect(post_1.Post.columns[2].dbType).toBe('integer');
        expect(post_1.Post.columns[2].foreignKey).toBeTruthy();
        expect(post_1.Post.columns[2].relatedTable).toBe('users');
        expect(post_1.Post.columns[2].unique).toBeUndefined();
        expect(post_1.Post.columns[2].defaultValue).toBeUndefined();
        expect(post_1.Post.columns[2].size).toBeUndefined();
        expect(post_1.Post.columns[2].notNullable).toBe(true);
        expect(post_1.Post.columns[2].index).toBeUndefined();
        expect(tableSchema[3].name).toBe('user_id');
        expect(tableSchema[3].type).toBe('integer');
        expect(tableSchema[3].notnull).toBeTruthy();
        expect(tableSchema[3].dflt_value).toBeNull();
        expect(tableSchema[3].pk).toBeFalsy();
    });
    describe('createColumn()', function () {
        test('Not nullable', function () {
            // User column "age" has "not nullable" constraint
            var user4 = new user_1.User({ name: "user4", admin: 0 });
            expect(function () {
                user4.save();
            }).toThrow();
        });
        test('Unique constraint', function () {
            // User column "name" has "unique" constraint
            var user5 = new user_1.User({ name: "user5", age: "55", admin: 0 });
            var user6 = new user_1.User({ name: "user5", age: "66", admin: 0 });
            expect(function () {
                user5.save();
                user6.save();
            }).toThrow();
        });
    });
    test('isForeignKey()', function () {
        var postTableColumns = post_1.Post.columns;
        expect(postTableColumns[2].foreignKey).toBeTruthy();
        expect(postTableColumns[1].foreignKey).toBeUndefined();
    });
});
//# sourceMappingURL=column.test.js.map