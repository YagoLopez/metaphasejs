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
//todo: poder ejecutar consulta sql que conste de varias sentencias en varias lineas
//todo: quitar el plural de las tablas = tableName();
//todo: hacer fn para paginacion. params: limit (rows per page), offset: (num. pag)
//getAllPaginated(pagNum, recordNum)
//todo: probar en edge y explorer
//todo: hacer mutators transaccionales o averiguar si por defecto sqlite hace las operaciones transaccionales
//todo: no usar cadena literal para nombre de columna 'id'
//todo: faltan relaciones "one to one" y "many to many"
//todo: documentar funciones
//todo: fn borrar tabla
//todo: implementar logger usando decorators
var database_1 = require("./database");
var query_builder_1 = require("./query.builder");
var column_1 = require("./column");
var base_1 = require("./base");
var model_1 = require("./model");
/**
 * Manages a collection of models (rows in a db table)
 * It follows Repository pattern
 */
var Collection = /** @class */ (function (_super) {
    __extends(Collection, _super);
    function Collection(model) {
        var _this = _super.call(this) || this;
        _this.model = model;
        if (_this.hasRelations()) {
            _this.createRelations();
        }
        _this.createTable(_this.tableName(), model.columns);
        return _this;
    }
    Collection.prototype.createTable = function (tableName, columns) {
        var _this = this;
        var createTableQuery = query_builder_1.query.schema.raw('PRAGMA foreign_keys=ON')
            .dropTableIfExists(tableName).createTable(tableName, function (tableBuilder) {
            _this.createColumns(columns, tableBuilder);
        });
        database_1.db.runQuery(createTableQuery);
    };
    //todo: hacer static
    Collection.prototype.createColumns = function (columns, tableBuilder) {
        tableBuilder.increments('id');
        for (var i in columns) {
            columns[i].createColumn(tableBuilder);
        }
    };
    /**
     * Given an array of pojos it returns an array of model instances
     * @param {Object[]} pojos (Plain Old Javascript Object)
     * @returns {Object[]}
     */
    Collection.prototype.createModelInstances = function (pojos) {
        for (var i = 0; i < pojos.length; i++) {
            pojos[i] = model_1.Model.create(pojos[i], this.model);
        }
        return pojos;
    };
    Collection.prototype.getAll = function (load) {
        if (load === void 0) { load = { children: false }; }
        var result = database_1.db.execQuery("select * from " + this.tableName());
        var models = this.createModelInstances(result);
        console.table(result);
        if (load.children) {
            models.forEach(function (model) { return model.getChildrenAll(); });
            return models;
        }
        else {
            return this.createModelInstances(result);
        }
    };
    Collection.prototype.getById = function (id, load) {
        if (load === void 0) { load = { children: false }; }
        var result = database_1.db.execQuery("select * from " + this.tableName() + " where id=" + id)[0];
        var model = new this.model(result);
        console.log(model);
        if (load.children) {
            model.getChildrenAll();
        }
        return model;
    };
    Collection.prototype.getByFilter = function (filter, columns, load) {
        if (columns === void 0) { columns = []; }
        if (load === void 0) { load = { children: false }; }
        var result = query_builder_1.query.select(columns).from(this.tableName()).where(filter).run();
        console.table(result);
        if (load.children) {
            var models = this.createModelInstances(result);
            models.forEach(function (model) { return model.getChildrenAll(); });
            return models;
        }
        else {
            return this.createModelInstances(result);
        }
    };
    Collection.prototype.getByOperator = function (termA, operator, termB, columns, load) {
        if (columns === void 0) { columns = []; }
        if (load === void 0) { load = { children: false }; }
        var result = query_builder_1.query.select(columns).from(this.tableName()).where(termA, operator, termB).run();
        console.table(result);
        if (load.children) {
            var models = this.createModelInstances(result);
            models.forEach(function (model) { return model.getChildrenAll(); });
            return models;
        }
        else {
            return this.createModelInstances(result);
        }
    };
    Collection.prototype.hasRelations = function () {
        return this.model.prototype.hasMany;
    };
    Collection.prototype.createColumnRelation = function (index) {
        var model = this.model;
        var relatedModel = model.prototype.hasMany()[index];
        var newColumnRelation = new column_1.Column({
            name: model.name.toLowerCase() + '_id',
            dbType: "integer" /* INTEGER */,
            foreignKey: true,
            relatedTable: model.name.toLowerCase() + 's',
            notNullable: true
        });
        var logFormat = 'color: grey; border-color: lightgrey; border-style: solid; border-width: 1px; ' +
            'border-radius: 2px; padding: 2px; background-color: #f0f0f5';
        console.log("%c \u26BF Foreign-key column created in table " + relatedModel.prototype.tableName() + ": ", logFormat);
        console.log(newColumnRelation);
        var relatedModelColumns = relatedModel.prototype.constructor.columns;
        relatedModelColumns.push(newColumnRelation);
    };
    Collection.prototype.createRelations = function () {
        var relationsList = this.model.prototype.hasMany();
        for (var index = 0; index < relationsList.length; index++) {
            this.createColumnRelation(index);
        }
    };
    /**
     * Get table structure and metadata for a model
     * @param modelClass
     * @returns {Object[]} Column metadata
     */
    Collection.getTableSchema = function (modelClass) {
        return database_1.db.execQuery("PRAGMA table_info(" + modelClass.prototype.tableName() + ")");
    };
    /**
     * Get Knex query-builder for this collection/table
     * @returns {any}
     */
    Collection.prototype.query = function () {
        return query_builder_1.query(this.tableName());
    };
    /**
     * Returns table schema with column metadata
     * @param {string} tableName
     * @param {string} columnName
     * @returns {boolean}
     */
    Collection.hasColumn = function (tableName, columnName) {
        var results = database_1.db.exec("SELECT COUNT(*) AS MATCHED_COLUMNS \n      FROM pragma_table_info('" + tableName + "') WHERE name='" + columnName + "'");
        return results[0].values[0][0] > 0;
    };
    /**
     * For posible future use
     * Deletes the table corresponding to the collection
     * @param {"string"} tableName
     */
    Collection.deleteTable = function (tableName) {
        database_1.db.runQuery(query_builder_1.query.schema.dropTableIfExists(tableName));
    };
    return Collection;
}(base_1.Base));
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map