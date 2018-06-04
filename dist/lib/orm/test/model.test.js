"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collection_1 = require("../collection");
var user_1 = require("./models/user");
var post_1 = require("./models/post");
var comment_1 = require("./models/comment");
var model_1 = require("../model");
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
describe('Model Class', function () {
    describe('● constructor()', function () {
        test('Without parameters', function () {
            var user4 = new user_1.User();
            user4.name = "user4";
            user4.age = 44;
            user4.admin = 0;
            var idUser4 = user4.save();
            var result = users.getByFilter({ name: "user4", age: 44, admin: 0 })[0];
            expect(result).toEqual({ id: idUser4, name: "user4", age: 44, admin: 0 });
        });
        test('With parameters', function () {
            var user5 = new user_1.User({ name: "user5", age: 55, admin: 1 });
            var idUser5 = user5.save();
            var result = users.getByFilter({ name: "user5", age: 55, admin: 1 })[0];
            expect(result).toEqual({ id: idUser5, name: "user5", age: 55, admin: 1 });
        });
    });
    test('getChildrenAll()', function () {
        user1.getChildrenAll();
        expect(user1.posts.length).toBe(2);
        expect(user1.posts[0]).toBeInstanceOf(post_1.Post);
        expect(user1.posts[0].comments.length).toBe(2);
        expect(user1.posts[0].comments[0]).toBeInstanceOf(comment_1.Comment);
        expect(user1.posts[1].comments.length).toBe(0);
    });
    describe('● getChildren()', function () {
        test('From root model: user1.getChildren(Post)', function () {
            var user1Related = user1.getChildren(post_1.Post);
            expect(user1Related.length).toBe(2);
            expect(user1Related[0]).toBeInstanceOf(post_1.Post);
        });
        test('From not root model: post1.getChildren(Comment)', function () {
            var post1Children = post1.getChildren(comment_1.Comment);
            expect(post1Children.length).toBe(2);
            expect(post1Children[0]).toBeInstanceOf(comment_1.Comment);
        });
        test('Model has no children: user3.getChildren(Post)', function () {
            var result = post3.getChildren(comment_1.Comment);
            expect(result.length).toBe(0);
        });
        test('Invalid children model argument: user1.getChildren(Comment)', function () {
            var result;
            expect(function () { return result = user1.getChildren(comment_1.Comment); });
            expect(result).toBeUndefined();
        });
        test('Invalid children model argument: post1.getChildren(User)', function () {
            var result;
            expect(function () { return result = user1.getChildren(user_1.User); });
            expect(result).toBeUndefined();
        });
        test('Invalid children model argument: post1.getChildren(Post)', function () {
            var result;
            expect(function () { return result = user1.getChildren(post_1.Post); });
            expect(result).toBeUndefined();
        });
    });
    describe('● getParent()', function () {
        test('Model has one parent', function () {
            var parent1 = post1.getParent(user_1.User)[0];
            expect(parent1).toHaveProperty('name', 'user1');
        });
        // test.only('Model has more than one parent', () => {
        // });
    });
    test('create()', function () {
        var user4 = model_1.Model.create({ name: 'user4', age: 44, admin: 1 }, user_1.User);
        expect(user4).toHaveProperty('name', 'user4');
        expect(user4).toHaveProperty('age', 44);
        expect(user4).toHaveProperty('admin', 1);
    });
    test('not isSaved()', function () {
        var user6 = model_1.Model.create({ name: 'user6', age: 66, admin: 0 }, user_1.User);
        expect(user6.isSaved()).toBeFalsy();
    });
    test('isSaved()', function () {
        var user6 = model_1.Model.create({ name: 'user6', age: 66, admin: 0 }, user_1.User);
        user6.save();
        expect(user6.isSaved()).toBeTruthy();
    });
    describe('● belongsTo()', function () {
        test('parent is saved', function () {
            var user7 = new user_1.User({ name: 'user7', age: 77, admin: 0 });
            user7.save();
            var post4 = new post_1.Post({ title: 'title post 4', content: 'content post 4' });
            post4.belongsTo(user7);
            post4.save();
            expect(user7.getChildren(post_1.Post)[0]).toHaveProperty('title', 'title post 4');
        });
        test('parent is not saved', function () {
            var user8 = new user_1.User({ name: 'user8', age: 88, admin: 0 });
            var post5 = new post_1.Post({ title: 'title post 5', content: 'content post 5' });
            expect(function () {
                post5.belongsTo(user8);
            }).toThrow();
        });
    });
});
//# sourceMappingURL=model.test.js.map