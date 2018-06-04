"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var collection_1 = require("../collection");
var user_1 = require("./models/user");
var post_1 = require("./models/post");
var comment_1 = require("./models/comment");
//todo: hacer fichero para cargar mock data solo una vez
// Mock data
// Users -----------------------------------------------------------------
var users = new collection_1.Collection(user_1.User);
var user1 = new user_1.User({ name: "user1", age: 11, admin: 0 });
var user2 = new user_1.User({ name: "user2", age: 22, admin: 1 });
var user3 = new user_1.User({ name: "user3", age: 33, admin: 1 });
users.save(user1);
users.save(user2);
users.save(user3);
// Posts -----------------------------------------------------------------
var posts = new collection_1.Collection(post_1.Post);
var post1 = new post_1.Post({ title: "title post 1", content: "content post 1" });
var post2 = new post_1.Post({ title: "title post 2", content: "content post 2" });
var post3 = new post_1.Post({ title: "title post 3", content: "content post 3" });
post1.belongsTo(user1);
post2.belongsTo(user1);
post3.belongsTo(user3);
posts.save(post1);
posts.save(post2);
posts.save(post3);
// Comments -----------------------------------------------------------------
var comments = new collection_1.Collection(comment_1.Comment);
var comment1 = new comment_1.Comment({ author: 'author1', date: 'date1' });
var comment2 = new comment_1.Comment({ author: 'author2', date: 'date2' });
comment1.belongsTo(post1);
comment2.belongsTo(post1);
comment1.save();
comment2.save();
// ---------------------------------------------------------------------------
describe('Collection Class', function () {
    test('constructor()', function () {
        expect(collection_1.Collection.hasColumn('users', 'name')).toBeTruthy();
        expect(collection_1.Collection.hasColumn('users', 'age')).toBeTruthy();
        expect(collection_1.Collection.hasColumn('users', 'admin')).toBeTruthy();
        expect(collection_1.Collection.hasColumn('posts', 'title')).toBeTruthy();
        expect(collection_1.Collection.hasColumn('posts', 'content')).toBeTruthy();
        expect(collection_1.Collection.getTableSchema(user_1.User).length).toBe(4);
        expect(collection_1.Collection.getTableSchema(post_1.Post).length).toBe(4);
    });
    test('query() - query builder obtained from collection', function () {
        var result = users.query().where('name', 'user1').run();
        expect(result.length).toBe(1);
    });
    describe('● getById()', function () {
        test('getById(1) - searched model has children', function () {
            var user_withChildren1 = users.getById(1);
            expect(user_withChildren1).toHaveProperty('name', 'user1');
            expect(user_withChildren1.posts).toBeUndefined();
        });
        test('getById(1, {children: false}) - searched model has children', function () {
            var user_withChildren2 = users.getById(1, { children: false });
            expect(user_withChildren2).toHaveProperty('name', 'user1');
            expect(user_withChildren2.posts).toBeUndefined();
        });
        test('getById(3, {children: true}) - searched model has not children: ', function () {
            var post3_withChildren = posts.getById(3, { children: true });
            expect(post3_withChildren.comments.length).toBe(0);
        });
    });
    describe('● getByFilter()', function () {
        test('getByFilter({name: user1}) - searched model has children, column param, no children param', function () {
            var result = users.getByFilter({ name: 'user1' }, ['name']);
            expect(result[0]).toHaveProperty('name', 'user1');
            expect(result[0].age).toBeUndefined();
            expect(result[0].admin).toBeUndefined();
            expect(result[0].posts).toBeUndefined();
        });
        test('getByFilter({name: user1}) - searched model has children and no children parameter', function () {
            var userWithChildren1 = users.getByFilter({ name: 'user1' });
            expect(userWithChildren1.length).toBe(1);
            expect(userWithChildren1[0].posts).toBeUndefined();
        });
        test('getByFilter({name: user1, age: 11, admin: 0}) - searched model has children and no children parameter', function () {
            var user_withChildren2 = users.getByFilter({ name: 'user1', age: 11, admin: 0 });
            expect(user_withChildren2.length).toBe(1);
            expect(user_withChildren2[0].posts).toBeUndefined();
        });
        test('getByFilter({name: user1}, {children: false}) - searched model has children and children parameter', function () {
            var user_withChildren3 = users.getByFilter({ name: 'user1' }, [], { children: false });
            expect(user_withChildren3.length).toBe(1);
            expect(user_withChildren3[0].posts).toBeUndefined();
        });
        test('getByFilter(3, {children: true}) - searched model has not children and children parameter', function () {
            var post3_withChildren2 = posts.getByFilter({ title: 'title post 3' }, [], { children: true })[0];
            expect(post3_withChildren2.comments.length).toBe(0);
        });
    });
    describe('● getByOperator()', function () {
        test('getByOperator("name", "=", "user1") - searched model has children', function () {
            var u1 = users.getByOperator('name', '=', 'user1');
            expect(u1.length).toBe(1);
            expect(u1[0].posts).toBeUndefined();
        });
        test('getByOperator("age", "<", 20, ["name"]) - searched model has children, column param, no children param', function () {
            var result = users.getByOperator('age', '<', 20, ['name']);
            expect(result.length).toBe(1);
            expect(result[0]).toHaveProperty('name', 'user1');
            expect(result[0].age).toBeUndefined();
            expect(result[0].admin).toBeUndefined();
            expect(result[0].posts).toBeUndefined();
        });
        test('getByOperator("name", "=", "user1", [], {children: true}) - searched model has children', function () {
            var u2 = users.getByOperator('name', '=', 'user1', [], { children: true });
            expect(u2.length).toBe(1);
            expect(u2[0].posts.length).toBe(2);
        });
        test('getByOperator("name", "=", "user1", [], {children: false}) - searched model has children', function () {
            var u3 = users.getByOperator('name', '=', 'user1', [], { children: false });
            expect(u3.length).toBe(1);
            expect(u3[0].posts).toBeUndefined();
        });
        test('getByOperator("title", "=", "title post 3", [], {children: true}) - searched model has not children', function () {
            var p2 = posts.getByOperator('title', '=', 'title post 3', [], { children: true });
            expect(p2.length).toBe(1);
            expect(p2[0].comments.length).toBe(0);
        });
    });
    describe('● getAll()', function () {
        test('without children', function () {
            var allComments = comments.getAll();
            expect(allComments.length).toBe(2);
        });
        test('with children', function () {
            var allUsers = users.getAll({ children: true });
            expect(allUsers.length).toBe(3);
            expect(allUsers[0].posts.length).toBe(2);
            expect(allUsers[0].posts[0].comments.length).toBe(2);
            expect(allUsers[0].posts[1].comments.length).toBe(0);
            expect(allUsers[1].posts.length).toBe(0);
            expect(allUsers[2].posts.length).toBe(1);
        });
    });
    test('getTableSchema()', function () {
        var result = collection_1.Collection.getTableSchema(user_1.User);
        var columnName = result[1];
        expect(result.length).toBe(4);
        expect(columnName.dflt_value).toBeNull();
        expect(columnName.name).toBe('name');
        expect(columnName.notnull).toBe(0);
        expect(columnName.pk).toBe(0);
        expect(columnName.type).toBe('varchar(255)');
    });
    test('hasColumn()', function () {
        expect(collection_1.Collection.hasColumn('users', 'name')).toBe(true);
        expect(collection_1.Collection.hasColumn('users', 'age')).toBe(true);
        expect(collection_1.Collection.hasColumn('users', 'xxx')).toBe(false);
    });
    // Note: this test must be the last one in the file
    test('getIdLastRecordInserted()', function () {
        var user4 = new user_1.User({ name: "user4", age: 44, admin: 1 });
        var idUser4 = users.save(user4);
        expect(database_1.db.getIdLastRecordInserted()).toBe(idUser4);
    });
    test('deleteTable()', function () {
        collection_1.Collection.deleteTable('posts');
        expect(collection_1.Collection.getTableSchema(post_1.Post).length).toBe(0);
    });
});
//# sourceMappingURL=collection.test.js.map