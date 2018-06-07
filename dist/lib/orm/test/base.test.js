"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collection_1 = require("../collection");
var query_builder_1 = require("../query.builder");
var user_1 = require("./models/user");
var post_1 = require("./models/post");
var comment_1 = require("./models/comment");
var users = new collection_1.Collection(user_1.User);
var user1 = new user_1.User({ name: "user1", age: 11, admin: 0 });
var user2 = new user_1.User({ name: "user2", age: 22, admin: 1 });
describe('Base Class', function () {
    it('tableName()', function () {
        expect(user1.tableName()).toBe('users');
        expect(users.tableName()).toBe('users');
    });
    it('insert()', function () {
        var user3 = new user_1.User({ name: 'user3', age: 33, admin: 1 });
        user3.save();
        var result = query_builder_1.query().select().from('users').where({ name: 'user3', age: 33 }).getOne();
        expect(result).toHaveProperty('name', 'user3');
        expect(result).toHaveProperty('age', 33);
    });
    describe('● update()', function () {
        it('Model created with constructor parameters', function () {
            var user4 = new user_1.User({ name: 'user4', age: 44, admin: 1 });
            user4.age = 400;
            user4.save();
            user4.name = 'name changed';
            user4.save();
            var result = query_builder_1.query().select().from('users').where({ name: 'name changed', age: 400 }).getOne();
            expect(result).toHaveProperty('name', 'name changed');
            expect(result).toHaveProperty('age', 400);
        });
        it('Model created without constructor parameters', function () {
            var user5 = new user_1.User();
            user5.name = 'user5';
            user5.age = 55;
            user5.save();
            var result = query_builder_1.query().select().from('users').where({ name: 'user5', age: 55 }).getOne();
            expect(result).toHaveProperty('name', 'user5');
            expect(result).toHaveProperty('age', 55);
        });
    });
    it('save()', function () {
        var user6 = new user_1.User({ name: 'user6', age: 66, admin: 1 });
        user6.save();
        var result = query_builder_1.query().select().from('users').where({ name: 'user6', age: 66 }).getOne();
        expect(result).toHaveProperty('name', 'user6');
        expect(result).toHaveProperty('age', 66);
    });
    describe('● remove()', function () {
        it('Remove model without children (whitout cascade deletion)', function () {
            var user7 = new user_1.User({ name: 'user7', age: 77, admin: 0 });
            users.save(user7);
            var idUserRemoved = user7.remove();
            expect(query_builder_1.query().select().from('users').where('id', idUserRemoved).run().length).toBe(0);
            var user8 = new user_1.User({ name: 'user8', age: 88, admin: 0 });
            users.save(user8);
            var idUserRemoved2 = users.remove(user8);
            expect(users.query().where('id', idUserRemoved2).run().length).toBe(0);
        });
        it('Remove model with children (with cascade deletion)', function () {
            var user9 = new user_1.User({ name: 'user9', age: 99, admin: 0 });
            users.save(user9);
            var posts = new collection_1.Collection(post_1.Post);
            var post9 = new post_1.Post({ title: 'title post 9', content: 'content post 9' });
            post9.belongsTo(user9);
            post9.save();
            var comments = new collection_1.Collection(comment_1.Comment);
            var comment9 = new comment_1.Comment({ author: 'author9', date: 'date9' });
            comment9.belongsTo(post9);
            comment9.save();
            user9.remove();
            var result1 = posts.getByFilter({ title: 'title post 9' });
            var result2 = comments.getByFilter({ author: 'author9' });
            expect(result1.length).toBe(0);
            expect(result2.length).toBe(0);
        });
    });
});
//# sourceMappingURL=base.test.js.map