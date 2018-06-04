"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var decorators_1 = require("../decorators");
var collection_1 = require("../collection");
var user_1 = require("./models/user");
// Users -----------------------------------------------------------------
var users = new collection_1.Collection(user_1.User);
var user1 = new user_1.User({ name: "user1", age: 11, admin: 0 });
// ------------------------------------------------------------------------
describe('Column Decorator', function () {
    test('column()', function () {
        var columnName = user1.__proto__.constructor.columns[0];
        expect(columnName.name).toBe('name');
        expect(columnName.dbType).toBe('varchar');
        expect(columnName.defaultValue).toBe(undefined);
        expect(columnName.foreignKey).toBe(undefined);
        expect(columnName.index).toBe(undefined);
        expect(columnName.notNullable).toBe(undefined);
        expect(columnName.relatedTable).toBe(undefined);
        expect(columnName.unique).toBe(true);
        expect(columnName.size).toBe(undefined);
    });
    test('getDBTypeFromPropType(String)', function () {
        var result = decorators_1.getDBTypeFromPropType('String');
        expect(result).toBe("varchar" /* STRING */);
    });
    test('getDBTypeFromPropType(Number)', function () {
        var result = decorators_1.getDBTypeFromPropType('Number');
        expect(result).toBe("integer" /* INTEGER */);
    });
    test('getDBTypeFromPropType(Null)', function () {
        var result = decorators_1.getDBTypeFromPropType('Null');
        expect(result).toBe("null" /* NULL */);
    });
    test('getDBTypeFromPropType(Boolean) - Invalid prop type', function () {
        expect(function () {
            decorators_1.getDBTypeFromPropType('Boolean');
        }).toThrow();
    });
});
//# sourceMappingURL=decorators.test.js.map