"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var collection_1 = require("../collection");
var user_1 = require("./models/user");
var users = new collection_1.Collection(user_1.User);
var user1 = new user_1.User({ name: "user1", age: 11, admin: 0 });
user1.save();
describe('Database Module', function () {
    test('execQuery()', function () {
        var result = database_1.db.execQuery(users.query().where('name', 'user1'));
        expect(result.length).toBe(1);
    });
    test('runQuery()', function () {
        var query = users.query().where('name', 'user1');
        var result = database_1.db.runQuery(query);
        expect(result).toBeInstanceOf(database_1.db.constructor);
    });
    test('integrityCheck()', function () {
        expect(database_1.db.integrityCheck()[0]).toHaveProperty('integrity_check', 'ok');
    });
});
//# sourceMappingURL=database.test.js.map