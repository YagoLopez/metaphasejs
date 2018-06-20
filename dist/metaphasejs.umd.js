(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.metaphasejs = {})));
}(this, (function (exports) { 'use strict';

  // Debugger in the browser console can be controlled through a url query parameter.
  // For example: http://localhost:3000?logger=true
  /**
   * Controls default logger behaviour.
   * Pass a 'false' value to avoid logger. This is the desired behaviour for production.
   * @type {string}
   */
  var DEFAULT_LOG_STATE = 'false';
  /**
   * Gets url query parameter form URL
   * @param {string} paramName
   * @returns {string}
   */
  var getUrlParameter = function (paramName) {
      paramName = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + paramName + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };
  /**
   * Update query string parameter
   * @param {string} uri
   * @param {string} key
   * @param {string} value
   * @return {string}
   */
  function updateQueryStringParameter(uri, key, value) {
      var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      var separator = uri.indexOf('?') !== -1 ? "&" : "?";
      if (uri.match(re)) {
          return uri.replace(re, '$1' + key + "=" + value + '$2');
      }
      else {
          return uri + separator + key + "=" + value;
      }
  }
  // Variable that holds the looger state
  var urlLogParam = getUrlParameter('logger');
  urlLogParam = urlLogParam || DEFAULT_LOG_STATE;
  /**
   * Disables console output messages (except error).
   * Used for production mode
   */
  function disableConsole() {
      // console = console || {};
      console.log = function () { };
      console.table = function () { };
      console.warn = function () { };
  }
  if (urlLogParam === 'false') {
      disableConsole();
  }
  /**
   * Logs message formats: foreground color, background color
   * CSS syntax is used to format messages
   * @type {Object}
   */
  var LOG_FORMAT = {
      BLUE: 'background: ghostwhite; color: cornflowerblue; font-size: 12px; font-weight: bold',
      ORANGE: 'color: orange',
      BG_YELLOW: 'background-color: yellow'
  };
  /**
   * Logs sql query strings and query results, appling two formats:
   * Input (query): blue colors
   * Output (result): yellow colors
   * @param {string} msg
   * @param {"query" | "result" | string} format
   */
  function logQuery(msg, format) {
      if (format === 'query') {
          var format_1 = LOG_FORMAT.BLUE;
          console.log("%c" + msg, format_1);
      }
      else if (format === 'result') {
          var format_2 = LOG_FORMAT.ORANGE;
          console.log("%c\u2705 " + msg, format_2);
      }
      else {
          console.log("%c" + msg, format);
      }
  }
  /**
   * General Fn to apply format to a log message
   * @param {string} msg
   * @param {string} format
   */
  function log(msg, format) {
      console.log("%c" + msg, format);
  }
  /* Using a global variable: ********************************** */
  // interface window {
  //   DEBUG: boolean;
  // }
  //
  // export const setDebugLevel = (flag: boolean = true): void => {
  //   (window as any).DEBUG = flag;
  // };
  /* Get query string parameters for modern browsers. Doesnt work with Jest. A shim is needed */
  // const urlParams = new URLSearchParams(window.location.search);
  // let urlLogParam = urlParams.get('log');

  //todo: usar whatg-fetch en lugar de fetch para compatibilidad navegador (?)
  var sql = require('sql.js');
  var FileSaver = require('file-saver');
  /**
   * Database instance
   * @type {SQL} Global variable created by 'sql.js'
   */
  exports.db = new sql.Database();
  exports.db.__proto__.setDatabase = function (database) {
      exports.db = database;
  };
  exports.db.__proto__.runQuery = function (query) {
      var queryString = query.toString();
      logQuery(queryString, 'query');
      return exports.db.run(queryString);
  };
  exports.db.__proto__.execQuery = function (query, useLogger) {
      if (useLogger === void 0) { useLogger = true; }
      useLogger && logQuery(query.toString(), 'query');
      return exports.db.getResults(exports.db.prepare(query.toString()));
  };
  exports.db.__proto__.getResults = function (statement) {
      var result = [];
      while (statement.step()) {
          result.push(statement.getAsObject());
      }
      statement.free();
      return result;
  };
  exports.db.__proto__.hasTable = function (tableName) {
      var result = exports.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "'");
      return result && result.length > 0;
  };
  exports.db.__proto__.integrityCheck = function () {
      return exports.db.execQuery('PRAGMA integrity_check', false);
  };
  exports.db.__proto__.getSchema = function () {
      return exports.db.execQuery('SELECT "name", "sql" FROM "sqlite_master" WHERE type="table"');
  };
  exports.db.__proto__.getIdLastRecordInserted = function () {
      var result = exports.db.execQuery('SELECT last_insert_rowid()', false);
      return result && result[0]['last_insert_rowid()'];
  };
  var loadDbFromFile = function (fileNamePath, actionFn) {
      fetch(fileNamePath)
          .then(function (response) {
          if (response) {
              return response.arrayBuffer();
          }
      }).then(function (arrayBuffer) {
          if (arrayBuffer) {
              var dbFile = new Uint8Array(arrayBuffer);
              var dbInstance = new SQL.Database(dbFile);
              exports.db.setDatabase(dbInstance);
              try {
                  exports.db.integrityCheck();
              }
              catch (error) {
                  console.error(error);
                  alert("Error loading db file: \"" + fileNamePath + "\"");
              }
              console.clear();
              var logFormat = 'background: cornflowerblue; color: white; font-weight: ';
              console.log("%c Database loaded from file \"" + fileNamePath + "\" ", logFormat);
              exports.db.execQuery('PRAGMA foreign_keys=ON;');
              actionFn();
          }
      })
          .catch(function (error) {
          console.error(error);
          alert('Error loading db file');
      });
  };
  var saveDbToFile = function (fileNamePath) {
      try {
          var isFileSaverSupported = !!new Blob;
          var uint8Array = exports.db.export();
          var buffer = new Buffer(uint8Array);
          var file = new File([buffer], fileNamePath, { type: 'application/octet-stream' });
          FileSaver.saveAs(file);
      }
      catch (exception) {
          alert('Save file to disk not supported by browser');
          console.error(exception);
      }
      exports.db.execQuery('PRAGMA foreign_keys=ON;');
  };
  console.clear();

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var knex = require('knex');

  if (process.env.NODE_ENV !== 'test') {
      /**
       * Query-Builder: creates sql query strings using functions
       * @type {Knex}
       */
      exports.query = knex({
          client: 'sqlite',
          connection: { filename: ':memory:' },
          useNullAsDefault: true,
          database: 'metaphase_db'
      });
  }
  if (process.env.NODE_ENV === 'test') {
      var mockKnex = require('mock-knex');
      /**
       * Mocked query-builder for tests
       * @type {Knex}
       */
      exports.query = knex({
          client: 'sqlite',
          debug: false,
          useNullAsDefault: true,
          database: 'test_db'
      });
      mockKnex.mock(exports.query);
  }
  //todo: testar la funcion run() y getOne()
  //todo: emitir un evento personalizado para saber cuando se ha ejecutado una consulta
  //todo: renombrar getOne() a getFirst()
  /**
   * Execute database query using query-builder
   * Do not use arrow function because "this" type is incorrectly infered by typescript
   * @return {Object[]} list with query results
   */
  exports.query().__proto__.run = function () {
      return exports.db.execQuery(this);
  };
  /**
   * Execute database query using query-builder and return only first row
   * @return {Object} query result
   */
  exports.query().__proto__.getOne = function () {
      return exports.db.execQuery(this)[0];
  };

  var Base = /** @class */ (function () {
      function Base() {
      }
      Base.prototype.tableName = function () {
          var name;
          if (this.model) {
              name = this.model.name;
          }
          else {
              name = this.constructor.name;
          }
          return name.toLowerCase() + 's';
      };
      Base.prototype.insert = function (model) {
          model = model || this;
          exports.query.insert(model).into(this.tableName()).run();
          model.id = exports.db.getIdLastRecordInserted();
          return model.id;
      };
      Base.prototype.update = function (model) {
          exports.query.table(this.tableName()).update(model).where('id', model.id).run();
          return model.id;
      };
      Base.prototype.save = function (model) {
          model = model || this;
          var idModelSaved;
          if (model.isSaved()) {
              idModelSaved = this.update(model);
          }
          else {
              idModelSaved = this.insert(model);
          }
          (idModelSaved > 0) && logQuery("Saved " + model.constructor.name + " with id: " + idModelSaved, 'result');
          return idModelSaved;
      };
      Base.prototype.remove = function (model) {
          model = model || this;
          var deleteQuery = "delete from " + this.tableName() + " where id=" + model.id;
          exports.db.run(deleteQuery);
          logQuery(deleteQuery, 'query');
          logQuery("Deleted " + this.constructor.name + " with id: " + model.id, 'result');
          return model.id;
      };
      return Base;
  }());

  var NotSavedModelError = /** @class */ (function (_super) {
      __extends(NotSavedModelError, _super);
      function NotSavedModelError(model, relatedModel) {
          var _this = _super.call(this) || this;
          _this.model = model;
          _this.relatedModel = relatedModel;
          var relatedModelName;
          if (relatedModel.constructor.name === "Function") {
              relatedModelName = relatedModel.prototype.constructor.name;
          }
          else {
              relatedModelName = relatedModel.constructor.name;
          }
          var msg = "(" + model.constructor.name + ") = " + JSON.stringify(model) +
              (" must be saved to establish a relation with (" + relatedModelName + ")");
          throw new Error(msg);
          return _this;
      }
      return NotSavedModelError;
  }(Error));
  var InvalidPropTypeError = /** @class */ (function (_super) {
      __extends(InvalidPropTypeError, _super);
      function InvalidPropTypeError(jsType) {
          var _this = _super.call(this) || this;
          var msg = "Invalid model property type: \"" + jsType + "\". Allowed values: [\"string, number\"]";
          throw new Error(msg);
          return _this;
      }
      return InvalidPropTypeError;
  }(Error));
  var InvalidColumnData = /** @class */ (function (_super) {
      __extends(InvalidColumnData, _super);
      function InvalidColumnData(columnData) {
          var _this = _super.call(this) || this;
          var msg = "Invalid column data value: \"" + columnData + "\"";
          throw new Error(msg);
          return _this;
      }
      return InvalidColumnData;
  }(Error));

  var Model = /** @class */ (function (_super) {
      __extends(Model, _super);
      function Model(props) {
          var _this = _super.call(this) || this;
          Object.assign(_this, props);
          return _this;
      }
      /**
       * Factory for model instance creation
       * @param {Object} pojo (plain old javascript object)
       * @param {any} modelClass
       * @returns {Model}
       */
      Model.create = function (pojo, modelClass) {
          return new modelClass(pojo);
      };
      Model.prototype.isSaved = function () {
          return this.id !== undefined;
      };
      Model.prototype.getForeignKeyColumnName = function () {
          return this.constructor.name.toLowerCase() + '_id';
      };
      //todo: parametro para opcion escribir el modelo en la tabla de la bd {save: true}
      Model.prototype.belongsTo = function (model) {
          if (!model.isSaved) {
              throw new Error('Invalid model instance: ' + model);
          }
          if (!model.isSaved()) {
              throw new NotSavedModelError(model, this);
          }
          var foreignColumnName = model.getForeignKeyColumnName();
          this[foreignColumnName] = model.id;
          return this;
      };
      //todo: esto corresponde a la direccion inversa de una relacion. Igual se podria implementar como un decorator
      //igual que getChildren(). el decorador tendria que crear la fn hasMany() y getParent() o getChildren()
      //dependiendo de lado de la relacion (consultar typeorm para ver como lo hace)
      Model.prototype.getParent = function (model) {
          if (!this.isSaved()) {
              throw new NotSavedModelError(this, model);
          }
          var relatedTable = model.prototype.tableName();
          var fkColumnName = model.prototype.getForeignKeyColumnName();
          var idColValue = this[fkColumnName];
          var relatedModels = exports.query(relatedTable).where('id', idColValue).run();
          return relatedModels.map(function (obj) { return Model.create(obj, model); });
      };
      //todo: intentar crear dinamicamente esta funcion como "posts()" por ejemplo
      /**
       * Get first level related children models
       * @param model
       * @returns {Model[]}
       */
      Model.prototype.getChildren = function (model) {
          if (!this.isSaved()) {
              throw new NotSavedModelError(this, model);
          }
          var childTable = model.prototype.tableName();
          var fkColumnChildTable = this.getForeignKeyColumnName();
          try {
              var relatedModels = exports.query(childTable).where(fkColumnChildTable, this.id).run();
              return relatedModels.map(function (obj) { return Model.create(obj, model); });
          }
          catch (exception) {
              console.error("Model " + JSON.stringify(this) + " has no children of type \"" + model.name + "\"");
              console.error(exception);
              return [];
          }
      };
      /**
       * Get recursively all descendant models from this model
       */
      Model.prototype.getChildrenAll = function () {
          if (this.hasMany) {
              var childClasses = this.hasMany();
              for (var i = 0; i < childClasses.length; i++) {
                  var childModels = this.getChildren(childClasses[i]);
                  var newPropName = childClasses[i].prototype.tableName();
                  this[newPropName] = [];
                  for (var j = 0; j < childModels.length; j++) {
                      this[newPropName].push(childModels[j]);
                      childModels[j].getChildrenAll(); // recursive call
                  }
              }
          }
      };
      //todo: testar esta fn
      /**
       * Makes related models properties not enumerable
       * Use: if a model is fetched with all related (or children) models
       * when this model is saved an error is thrown due to properties containing related models
       * are not original model properties
       * This function can be used to "hide" (not enumerate) these props and save the model
       * @param {Model} model
       * returns {Model}
       */
      Model.omitChildrenProps = function (model) {
          model.hasChildren() && model.hasMany().forEach(function (relatedModel) {
              try {
                  Object.defineProperty(model, relatedModel.prototype.tableName(), { enumerable: false });
              }
              catch (exception) {
                  console.error(exception);
                  alert(exception);
              }
          });
          return model;
      };
      Model.prototype.hasChildren = function () {
          return this.hasMany !== undefined;
      };
      return Model;
  }(Base));

  //todo: funcionamiento para tipo de columna boolean. Poder usar "true/false"
  var Column = /** @class */ (function () {
      //todo: sqlite no soporta default values (solo null) eliminar la opcion "defaultValue"
      //`sqlite` does not support inserting default values. Specify values explicitly or use the `useNullAsDefault`
      // config flag. (see docs http://knexjs.org/#Builder-insert).
      function Column(_a) {
          var name = _a.name, size = _a.size, dbType = _a.dbType, foreignKey = _a.foreignKey, relatedTable = _a.relatedTable, unique = _a.unique, defaultValue = _a.defaultValue, notNullable = _a.notNullable, index = _a.index;
          this.name = name;
          this.dbType = dbType;
          this.foreignKey = foreignKey;
          this.relatedTable = relatedTable;
          this.unique = unique;
          this.defaultValue = defaultValue;
          this.size = size;
          this.notNullable = notNullable;
          this.index = index;
      }
      /**
       * Creates foreign key relation between two columns in two tables
       * Column 1: primary key column ('id')
       * Column 2: foreign key column (<modelName>_id)
       * Table 1: table
       * Table 2: this.relatedTable
       * Note: ColumnAction = 'Cascade' by default. Not configurable by now
       * @param {knex.TableBuilder} table
       */
      Column.prototype.createColumnsRelation = function (table) {
          if (!this.name) {
              throw new InvalidColumnData(this.name);
          }
          if (!this.relatedTable) {
              throw new InvalidColumnData(this.relatedTable);
          }
          table
              .foreign(this.name)
              .references('id')
              .inTable(this.relatedTable)
              .onDelete("cascade" /* Cascade */)
              .onUpdate("cascade" /* Cascade */);
      };
      /**
       * Create table columns based in column properties
       * @param {Knex.TableBuilder} table
       */
      Column.prototype.createColumn = function (table) {
          var newColumn;
          var colType = this.dbType;
          var colName = this.name;
          var colSize = this.size;
          this.size && console.warn('Size option exists for compatibility. It has no real effect');
          if (!colType || !colName) {
              throw new InvalidColumnData(colType || colName);
          }
          if (this.foreignKey) {
              this.createColumnsRelation(table);
          }
          if (this.notNullable) {
              newColumn = table[colType](colName).notNullable();
          }
          if (this.unique) {
              newColumn = Column.addUniqueConstraint(newColumn, table, colType, colName);
          }
          if (this.index) {
              newColumn = Column.addIndex(newColumn, table, colType, colName);
          }
          return newColumn || table[colType](colName, colSize);
      };
      Column.addUniqueConstraint = function (newColumn, tableBuilder, colType, colName) {
          if (newColumn) {
              return newColumn.unique();
          }
          else {
              return tableBuilder[colType](colName).unique();
          }
      };
      Column.addIndex = function (newColumn, tableBuilder, colType, colName) {
          if (newColumn) {
              return newColumn.index();
          }
          else {
              return tableBuilder[colType](colName).index();
          }
      };
      Column.prototype.isForeignKey = function () {
          return Boolean(this.foreignKey);
      };
      return Column;
  }());

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
          var createTableQuery = exports.query.schema.raw('PRAGMA foreign_keys=ON')
              .dropTableIfExists(tableName).createTable(tableName, function (tableBuilder) {
              _this.createColumns(columns, tableBuilder);
          });
          exports.db.runQuery(createTableQuery);
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
              pojos[i] = Model.create(pojos[i], this.model);
          }
          return pojos;
      };
      Collection.prototype.getAll = function (load) {
          if (load === void 0) { load = { children: false }; }
          var result = exports.db.execQuery("select * from " + this.tableName());
          var models = this.createModelInstances(result);
          console.table && console.table(result);
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
          var result = exports.db.execQuery("select * from " + this.tableName() + " where id=" + id)[0];
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
          var result = exports.query.select(columns).from(this.tableName()).where(filter).run();
          console.table && console.table(result);
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
          var result = exports.query.select(columns).from(this.tableName()).where(termA, operator, termB).run();
          console.table && console.table(result);
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
          var newColumnRelation = new Column({
              name: model.name.toLowerCase() + '_id',
              dbType: "integer" /* INTEGER */,
              foreignKey: true,
              relatedTable: model.name.toLowerCase() + 's',
              notNullable: true
          });
          var logFormat = 'color: grey; border-color: lightgrey; border-style: solid; border-width: 1px; ' +
              'border-radius: 2px; padding: 2px; background-color: #f0f0f5';
          console.log("%c \u26BF Foreign-key column created in table " + relatedModel.prototype.tableName() + "\u21B4 ", logFormat);
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
          return exports.db.execQuery("PRAGMA table_info(" + modelClass.prototype.tableName() + ")");
      };
      /**
       * Get Knex query-builder for this collection/table
       * @returns {any}
       */
      Collection.prototype.query = function () {
          return exports.query(this.tableName());
      };
      /**
       * Returns table schema with column metadata
       * @param {string} tableName
       * @param {string} columnName
       * @returns {boolean}
       */
      Collection.hasColumn = function (tableName, columnName) {
          var results = exports.db.exec("SELECT COUNT(*) AS MATCHED_COLUMNS \n      FROM pragma_table_info('" + tableName + "') WHERE name='" + columnName + "'");
          return results[0].values[0][0] > 0;
      };
      /**
       * For posible future use
       * Deletes the table corresponding to the collection
       * @param {"string"} tableName
       */
      Collection.deleteTable = function (tableName) {
          exports.db.runQuery(exports.query.schema.dropTableIfExists(tableName));
      };
      return Collection;
  }(Base));

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  /*! *****************************************************************************
  Copyright (C) Microsoft. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var Reflect$1;
  (function (Reflect) {
      // Metadata Proposal
      // https://rbuckton.github.io/reflect-metadata/
      (function (factory) {
          var root = typeof commonjsGlobal === "object" ? commonjsGlobal :
              typeof self === "object" ? self :
                  typeof this === "object" ? this :
                      Function("return this;")();
          var exporter = makeExporter(Reflect);
          if (typeof root.Reflect === "undefined") {
              root.Reflect = Reflect;
          }
          else {
              exporter = makeExporter(root.Reflect, exporter);
          }
          factory(exporter);
          function makeExporter(target, previous) {
              return function (key, value) {
                  if (typeof target[key] !== "function") {
                      Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                  }
                  if (previous)
                      previous(key, value);
              };
          }
      })(function (exporter) {
          var hasOwn = Object.prototype.hasOwnProperty;
          // feature test for Symbol support
          var supportsSymbol = typeof Symbol === "function";
          var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
          var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
          var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
          var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
          var downLevel = !supportsCreate && !supportsProto;
          var HashMap = {
              // create an object in dictionary mode (a.k.a. "slow" mode in v8)
              create: supportsCreate
                  ? function () { return MakeDictionary(Object.create(null)); }
                  : supportsProto
                      ? function () { return MakeDictionary({ __proto__: null }); }
                      : function () { return MakeDictionary({}); },
              has: downLevel
                  ? function (map, key) { return hasOwn.call(map, key); }
                  : function (map, key) { return key in map; },
              get: downLevel
                  ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                  : function (map, key) { return map[key]; },
          };
          // Load global or shim versions of Map, Set, and WeakMap
          var functionPrototype = Object.getPrototypeOf(Function);
          var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
          var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
          var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
          var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
          // [[Metadata]] internal slot
          // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
          var Metadata = new _WeakMap();
          /**
           * Applies a set of decorators to a property of a target object.
           * @param decorators An array of decorators.
           * @param target The target object.
           * @param propertyKey (Optional) The property key to decorate.
           * @param attributes (Optional) The property descriptor for the target key.
           * @remarks Decorators are applied in reverse order.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     Example = Reflect.decorate(decoratorsArray, Example);
           *
           *     // property (on constructor)
           *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
           *
           *     // property (on prototype)
           *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
           *
           *     // method (on constructor)
           *     Object.defineProperty(Example, "staticMethod",
           *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
           *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
           *
           *     // method (on prototype)
           *     Object.defineProperty(Example.prototype, "method",
           *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
           *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
           *
           */
          function decorate(decorators, target, propertyKey, attributes) {
              if (!IsUndefined(propertyKey)) {
                  if (!IsArray(decorators))
                      throw new TypeError();
                  if (!IsObject(target))
                      throw new TypeError();
                  if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                      throw new TypeError();
                  if (IsNull(attributes))
                      attributes = undefined;
                  propertyKey = ToPropertyKey(propertyKey);
                  return DecorateProperty(decorators, target, propertyKey, attributes);
              }
              else {
                  if (!IsArray(decorators))
                      throw new TypeError();
                  if (!IsConstructor(target))
                      throw new TypeError();
                  return DecorateConstructor(decorators, target);
              }
          }
          exporter("decorate", decorate);
          // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
          // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
          /**
           * A default metadata decorator factory that can be used on a class, class member, or parameter.
           * @param metadataKey The key for the metadata entry.
           * @param metadataValue The value for the metadata entry.
           * @returns A decorator function.
           * @remarks
           * If `metadataKey` is already defined for the target and target key, the
           * metadataValue for that key will be overwritten.
           * @example
           *
           *     // constructor
           *     @Reflect.metadata(key, value)
           *     class Example {
           *     }
           *
           *     // property (on constructor, TypeScript only)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         static staticProperty;
           *     }
           *
           *     // property (on prototype, TypeScript only)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         property;
           *     }
           *
           *     // method (on constructor)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         static staticMethod() { }
           *     }
           *
           *     // method (on prototype)
           *     class Example {
           *         @Reflect.metadata(key, value)
           *         method() { }
           *     }
           *
           */
          function metadata(metadataKey, metadataValue) {
              function decorator(target, propertyKey) {
                  if (!IsObject(target))
                      throw new TypeError();
                  if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                      throw new TypeError();
                  OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
              }
              return decorator;
          }
          exporter("metadata", metadata);
          /**
           * Define a unique metadata entry on the target.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param metadataValue A value that contains attached metadata.
           * @param target The target object on which to define metadata.
           * @param propertyKey (Optional) The property key for the target.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     Reflect.defineMetadata("custom:annotation", options, Example);
           *
           *     // property (on constructor)
           *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
           *
           *     // property (on prototype)
           *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
           *
           *     // method (on constructor)
           *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
           *
           *     // method (on prototype)
           *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
           *
           *     // decorator factory as metadata-producing annotation.
           *     function MyAnnotation(options): Decorator {
           *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
           *     }
           *
           */
          function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
          }
          exporter("defineMetadata", defineMetadata);
          /**
           * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.hasMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function hasMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryHasMetadata(metadataKey, target, propertyKey);
          }
          exporter("hasMetadata", hasMetadata);
          /**
           * Gets a value indicating whether the target object has the provided metadata key defined.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function hasOwnMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
          }
          exporter("hasOwnMetadata", hasOwnMetadata);
          /**
           * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function getMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryGetMetadata(metadataKey, target, propertyKey);
          }
          exporter("getMetadata", getMetadata);
          /**
           * Gets the metadata value for the provided metadata key on the target object.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getOwnMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function getOwnMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
          }
          exporter("getOwnMetadata", getOwnMetadata);
          /**
           * Gets the metadata keys defined on the target object or its prototype chain.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns An array of unique metadata keys.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getMetadataKeys(Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getMetadataKeys(Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getMetadataKeys(Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getMetadataKeys(Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getMetadataKeys(Example.prototype, "method");
           *
           */
          function getMetadataKeys(target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryMetadataKeys(target, propertyKey);
          }
          exporter("getMetadataKeys", getMetadataKeys);
          /**
           * Gets the unique metadata keys defined on the target object.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns An array of unique metadata keys.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.getOwnMetadataKeys(Example);
           *
           *     // property (on constructor)
           *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
           *
           */
          function getOwnMetadataKeys(target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              return OrdinaryOwnMetadataKeys(target, propertyKey);
          }
          exporter("getOwnMetadataKeys", getOwnMetadataKeys);
          /**
           * Deletes the metadata entry from the target object with the provided key.
           * @param metadataKey A key used to store and retrieve metadata.
           * @param target The target object on which the metadata is defined.
           * @param propertyKey (Optional) The property key for the target.
           * @returns `true` if the metadata entry was found and deleted; otherwise, false.
           * @example
           *
           *     class Example {
           *         // property declarations are not part of ES6, though they are valid in TypeScript:
           *         // static staticProperty;
           *         // property;
           *
           *         constructor(p) { }
           *         static staticMethod(p) { }
           *         method(p) { }
           *     }
           *
           *     // constructor
           *     result = Reflect.deleteMetadata("custom:annotation", Example);
           *
           *     // property (on constructor)
           *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
           *
           *     // property (on prototype)
           *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
           *
           *     // method (on constructor)
           *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
           *
           *     // method (on prototype)
           *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
           *
           */
          function deleteMetadata(metadataKey, target, propertyKey) {
              if (!IsObject(target))
                  throw new TypeError();
              if (!IsUndefined(propertyKey))
                  propertyKey = ToPropertyKey(propertyKey);
              var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return false;
              if (!metadataMap.delete(metadataKey))
                  return false;
              if (metadataMap.size > 0)
                  return true;
              var targetMetadata = Metadata.get(target);
              targetMetadata.delete(propertyKey);
              if (targetMetadata.size > 0)
                  return true;
              Metadata.delete(target);
              return true;
          }
          exporter("deleteMetadata", deleteMetadata);
          function DecorateConstructor(decorators, target) {
              for (var i = decorators.length - 1; i >= 0; --i) {
                  var decorator = decorators[i];
                  var decorated = decorator(target);
                  if (!IsUndefined(decorated) && !IsNull(decorated)) {
                      if (!IsConstructor(decorated))
                          throw new TypeError();
                      target = decorated;
                  }
              }
              return target;
          }
          function DecorateProperty(decorators, target, propertyKey, descriptor) {
              for (var i = decorators.length - 1; i >= 0; --i) {
                  var decorator = decorators[i];
                  var decorated = decorator(target, propertyKey, descriptor);
                  if (!IsUndefined(decorated) && !IsNull(decorated)) {
                      if (!IsObject(decorated))
                          throw new TypeError();
                      descriptor = decorated;
                  }
              }
              return descriptor;
          }
          function GetOrCreateMetadataMap(O, P, Create) {
              var targetMetadata = Metadata.get(O);
              if (IsUndefined(targetMetadata)) {
                  if (!Create)
                      return undefined;
                  targetMetadata = new _Map();
                  Metadata.set(O, targetMetadata);
              }
              var metadataMap = targetMetadata.get(P);
              if (IsUndefined(metadataMap)) {
                  if (!Create)
                      return undefined;
                  metadataMap = new _Map();
                  targetMetadata.set(P, metadataMap);
              }
              return metadataMap;
          }
          // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
          function OrdinaryHasMetadata(MetadataKey, O, P) {
              var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
              if (hasOwn)
                  return true;
              var parent = OrdinaryGetPrototypeOf(O);
              if (!IsNull(parent))
                  return OrdinaryHasMetadata(MetadataKey, parent, P);
              return false;
          }
          // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
          function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return false;
              return ToBoolean(metadataMap.has(MetadataKey));
          }
          // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
          function OrdinaryGetMetadata(MetadataKey, O, P) {
              var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
              if (hasOwn)
                  return OrdinaryGetOwnMetadata(MetadataKey, O, P);
              var parent = OrdinaryGetPrototypeOf(O);
              if (!IsNull(parent))
                  return OrdinaryGetMetadata(MetadataKey, parent, P);
              return undefined;
          }
          // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
          function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return undefined;
              return metadataMap.get(MetadataKey);
          }
          // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
          function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
              metadataMap.set(MetadataKey, MetadataValue);
          }
          // 3.1.6.1 OrdinaryMetadataKeys(O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
          function OrdinaryMetadataKeys(O, P) {
              var ownKeys = OrdinaryOwnMetadataKeys(O, P);
              var parent = OrdinaryGetPrototypeOf(O);
              if (parent === null)
                  return ownKeys;
              var parentKeys = OrdinaryMetadataKeys(parent, P);
              if (parentKeys.length <= 0)
                  return ownKeys;
              if (ownKeys.length <= 0)
                  return parentKeys;
              var set = new _Set();
              var keys = [];
              for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                  var key = ownKeys_1[_i];
                  var hasKey = set.has(key);
                  if (!hasKey) {
                      set.add(key);
                      keys.push(key);
                  }
              }
              for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                  var key = parentKeys_1[_a];
                  var hasKey = set.has(key);
                  if (!hasKey) {
                      set.add(key);
                      keys.push(key);
                  }
              }
              return keys;
          }
          // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
          // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
          function OrdinaryOwnMetadataKeys(O, P) {
              var keys = [];
              var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
              if (IsUndefined(metadataMap))
                  return keys;
              var keysObj = metadataMap.keys();
              var iterator = GetIterator(keysObj);
              var k = 0;
              while (true) {
                  var next = IteratorStep(iterator);
                  if (!next) {
                      keys.length = k;
                      return keys;
                  }
                  var nextValue = IteratorValue(next);
                  try {
                      keys[k] = nextValue;
                  }
                  catch (e) {
                      try {
                          IteratorClose(iterator);
                      }
                      finally {
                          throw e;
                      }
                  }
                  k++;
              }
          }
          // 6 ECMAScript Data Typ0es and Values
          // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
          function Type(x) {
              if (x === null)
                  return 1 /* Null */;
              switch (typeof x) {
                  case "undefined": return 0 /* Undefined */;
                  case "boolean": return 2 /* Boolean */;
                  case "string": return 3 /* String */;
                  case "symbol": return 4 /* Symbol */;
                  case "number": return 5 /* Number */;
                  case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                  default: return 6 /* Object */;
              }
          }
          // 6.1.1 The Undefined Type
          // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
          function IsUndefined(x) {
              return x === undefined;
          }
          // 6.1.2 The Null Type
          // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
          function IsNull(x) {
              return x === null;
          }
          // 6.1.5 The Symbol Type
          // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
          function IsSymbol(x) {
              return typeof x === "symbol";
          }
          // 6.1.7 The Object Type
          // https://tc39.github.io/ecma262/#sec-object-type
          function IsObject(x) {
              return typeof x === "object" ? x !== null : typeof x === "function";
          }
          // 7.1 Type Conversion
          // https://tc39.github.io/ecma262/#sec-type-conversion
          // 7.1.1 ToPrimitive(input [, PreferredType])
          // https://tc39.github.io/ecma262/#sec-toprimitive
          function ToPrimitive(input, PreferredType) {
              switch (Type(input)) {
                  case 0 /* Undefined */: return input;
                  case 1 /* Null */: return input;
                  case 2 /* Boolean */: return input;
                  case 3 /* String */: return input;
                  case 4 /* Symbol */: return input;
                  case 5 /* Number */: return input;
              }
              var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
              var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
              if (exoticToPrim !== undefined) {
                  var result = exoticToPrim.call(input, hint);
                  if (IsObject(result))
                      throw new TypeError();
                  return result;
              }
              return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
          }
          // 7.1.1.1 OrdinaryToPrimitive(O, hint)
          // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
          function OrdinaryToPrimitive(O, hint) {
              if (hint === "string") {
                  var toString_1 = O.toString;
                  if (IsCallable(toString_1)) {
                      var result = toString_1.call(O);
                      if (!IsObject(result))
                          return result;
                  }
                  var valueOf = O.valueOf;
                  if (IsCallable(valueOf)) {
                      var result = valueOf.call(O);
                      if (!IsObject(result))
                          return result;
                  }
              }
              else {
                  var valueOf = O.valueOf;
                  if (IsCallable(valueOf)) {
                      var result = valueOf.call(O);
                      if (!IsObject(result))
                          return result;
                  }
                  var toString_2 = O.toString;
                  if (IsCallable(toString_2)) {
                      var result = toString_2.call(O);
                      if (!IsObject(result))
                          return result;
                  }
              }
              throw new TypeError();
          }
          // 7.1.2 ToBoolean(argument)
          // https://tc39.github.io/ecma262/2016/#sec-toboolean
          function ToBoolean(argument) {
              return !!argument;
          }
          // 7.1.12 ToString(argument)
          // https://tc39.github.io/ecma262/#sec-tostring
          function ToString(argument) {
              return "" + argument;
          }
          // 7.1.14 ToPropertyKey(argument)
          // https://tc39.github.io/ecma262/#sec-topropertykey
          function ToPropertyKey(argument) {
              var key = ToPrimitive(argument, 3 /* String */);
              if (IsSymbol(key))
                  return key;
              return ToString(key);
          }
          // 7.2 Testing and Comparison Operations
          // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
          // 7.2.2 IsArray(argument)
          // https://tc39.github.io/ecma262/#sec-isarray
          function IsArray(argument) {
              return Array.isArray
                  ? Array.isArray(argument)
                  : argument instanceof Object
                      ? argument instanceof Array
                      : Object.prototype.toString.call(argument) === "[object Array]";
          }
          // 7.2.3 IsCallable(argument)
          // https://tc39.github.io/ecma262/#sec-iscallable
          function IsCallable(argument) {
              // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
              return typeof argument === "function";
          }
          // 7.2.4 IsConstructor(argument)
          // https://tc39.github.io/ecma262/#sec-isconstructor
          function IsConstructor(argument) {
              // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
              return typeof argument === "function";
          }
          // 7.2.7 IsPropertyKey(argument)
          // https://tc39.github.io/ecma262/#sec-ispropertykey
          function IsPropertyKey(argument) {
              switch (Type(argument)) {
                  case 3 /* String */: return true;
                  case 4 /* Symbol */: return true;
                  default: return false;
              }
          }
          // 7.3 Operations on Objects
          // https://tc39.github.io/ecma262/#sec-operations-on-objects
          // 7.3.9 GetMethod(V, P)
          // https://tc39.github.io/ecma262/#sec-getmethod
          function GetMethod(V, P) {
              var func = V[P];
              if (func === undefined || func === null)
                  return undefined;
              if (!IsCallable(func))
                  throw new TypeError();
              return func;
          }
          // 7.4 Operations on Iterator Objects
          // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
          function GetIterator(obj) {
              var method = GetMethod(obj, iteratorSymbol);
              if (!IsCallable(method))
                  throw new TypeError(); // from Call
              var iterator = method.call(obj);
              if (!IsObject(iterator))
                  throw new TypeError();
              return iterator;
          }
          // 7.4.4 IteratorValue(iterResult)
          // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
          function IteratorValue(iterResult) {
              return iterResult.value;
          }
          // 7.4.5 IteratorStep(iterator)
          // https://tc39.github.io/ecma262/#sec-iteratorstep
          function IteratorStep(iterator) {
              var result = iterator.next();
              return result.done ? false : result;
          }
          // 7.4.6 IteratorClose(iterator, completion)
          // https://tc39.github.io/ecma262/#sec-iteratorclose
          function IteratorClose(iterator) {
              var f = iterator["return"];
              if (f)
                  f.call(iterator);
          }
          // 9.1 Ordinary Object Internal Methods and Internal Slots
          // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
          // 9.1.1.1 OrdinaryGetPrototypeOf(O)
          // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
          function OrdinaryGetPrototypeOf(O) {
              var proto = Object.getPrototypeOf(O);
              if (typeof O !== "function" || O === functionPrototype)
                  return proto;
              // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
              // Try to determine the superclass constructor. Compatible implementations
              // must either set __proto__ on a subclass constructor to the superclass constructor,
              // or ensure each class has a valid `constructor` property on its prototype that
              // points back to the constructor.
              // If this is not the same as Function.[[Prototype]], then this is definately inherited.
              // This is the case when in ES6 or when using __proto__ in a compatible browser.
              if (proto !== functionPrototype)
                  return proto;
              // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
              var prototype = O.prototype;
              var prototypeProto = prototype && Object.getPrototypeOf(prototype);
              if (prototypeProto == null || prototypeProto === Object.prototype)
                  return proto;
              // If the constructor was not a function, then we cannot determine the heritage.
              var constructor = prototypeProto.constructor;
              if (typeof constructor !== "function")
                  return proto;
              // If we have some kind of self-reference, then we cannot determine the heritage.
              if (constructor === O)
                  return proto;
              // we have a pretty good guess at the heritage.
              return constructor;
          }
          // naive Map shim
          function CreateMapPolyfill() {
              var cacheSentinel = {};
              var arraySentinel = [];
              var MapIterator = (function () {
                  function MapIterator(keys, values, selector) {
                      this._index = 0;
                      this._keys = keys;
                      this._values = values;
                      this._selector = selector;
                  }
                  MapIterator.prototype["@@iterator"] = function () { return this; };
                  MapIterator.prototype[iteratorSymbol] = function () { return this; };
                  MapIterator.prototype.next = function () {
                      var index = this._index;
                      if (index >= 0 && index < this._keys.length) {
                          var result = this._selector(this._keys[index], this._values[index]);
                          if (index + 1 >= this._keys.length) {
                              this._index = -1;
                              this._keys = arraySentinel;
                              this._values = arraySentinel;
                          }
                          else {
                              this._index++;
                          }
                          return { value: result, done: false };
                      }
                      return { value: undefined, done: true };
                  };
                  MapIterator.prototype.throw = function (error) {
                      if (this._index >= 0) {
                          this._index = -1;
                          this._keys = arraySentinel;
                          this._values = arraySentinel;
                      }
                      throw error;
                  };
                  MapIterator.prototype.return = function (value) {
                      if (this._index >= 0) {
                          this._index = -1;
                          this._keys = arraySentinel;
                          this._values = arraySentinel;
                      }
                      return { value: value, done: true };
                  };
                  return MapIterator;
              }());
              return (function () {
                  function Map() {
                      this._keys = [];
                      this._values = [];
                      this._cacheKey = cacheSentinel;
                      this._cacheIndex = -2;
                  }
                  Object.defineProperty(Map.prototype, "size", {
                      get: function () { return this._keys.length; },
                      enumerable: true,
                      configurable: true
                  });
                  Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                  Map.prototype.get = function (key) {
                      var index = this._find(key, /*insert*/ false);
                      return index >= 0 ? this._values[index] : undefined;
                  };
                  Map.prototype.set = function (key, value) {
                      var index = this._find(key, /*insert*/ true);
                      this._values[index] = value;
                      return this;
                  };
                  Map.prototype.delete = function (key) {
                      var index = this._find(key, /*insert*/ false);
                      if (index >= 0) {
                          var size = this._keys.length;
                          for (var i = index + 1; i < size; i++) {
                              this._keys[i - 1] = this._keys[i];
                              this._values[i - 1] = this._values[i];
                          }
                          this._keys.length--;
                          this._values.length--;
                          if (key === this._cacheKey) {
                              this._cacheKey = cacheSentinel;
                              this._cacheIndex = -2;
                          }
                          return true;
                      }
                      return false;
                  };
                  Map.prototype.clear = function () {
                      this._keys.length = 0;
                      this._values.length = 0;
                      this._cacheKey = cacheSentinel;
                      this._cacheIndex = -2;
                  };
                  Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                  Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                  Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                  Map.prototype["@@iterator"] = function () { return this.entries(); };
                  Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                  Map.prototype._find = function (key, insert) {
                      if (this._cacheKey !== key) {
                          this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                      }
                      if (this._cacheIndex < 0 && insert) {
                          this._cacheIndex = this._keys.length;
                          this._keys.push(key);
                          this._values.push(undefined);
                      }
                      return this._cacheIndex;
                  };
                  return Map;
              }());
              function getKey(key, _) {
                  return key;
              }
              function getValue(_, value) {
                  return value;
              }
              function getEntry(key, value) {
                  return [key, value];
              }
          }
          // naive Set shim
          function CreateSetPolyfill() {
              return (function () {
                  function Set() {
                      this._map = new _Map();
                  }
                  Object.defineProperty(Set.prototype, "size", {
                      get: function () { return this._map.size; },
                      enumerable: true,
                      configurable: true
                  });
                  Set.prototype.has = function (value) { return this._map.has(value); };
                  Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                  Set.prototype.delete = function (value) { return this._map.delete(value); };
                  Set.prototype.clear = function () { this._map.clear(); };
                  Set.prototype.keys = function () { return this._map.keys(); };
                  Set.prototype.values = function () { return this._map.values(); };
                  Set.prototype.entries = function () { return this._map.entries(); };
                  Set.prototype["@@iterator"] = function () { return this.keys(); };
                  Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                  return Set;
              }());
          }
          // naive WeakMap shim
          function CreateWeakMapPolyfill() {
              var UUID_SIZE = 16;
              var keys = HashMap.create();
              var rootKey = CreateUniqueKey();
              return (function () {
                  function WeakMap() {
                      this._key = CreateUniqueKey();
                  }
                  WeakMap.prototype.has = function (target) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                      return table !== undefined ? HashMap.has(table, this._key) : false;
                  };
                  WeakMap.prototype.get = function (target) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                      return table !== undefined ? HashMap.get(table, this._key) : undefined;
                  };
                  WeakMap.prototype.set = function (target, value) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                      table[this._key] = value;
                      return this;
                  };
                  WeakMap.prototype.delete = function (target) {
                      var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                      return table !== undefined ? delete table[this._key] : false;
                  };
                  WeakMap.prototype.clear = function () {
                      // NOTE: not a real clear, just makes the previous data unreachable
                      this._key = CreateUniqueKey();
                  };
                  return WeakMap;
              }());
              function CreateUniqueKey() {
                  var key;
                  do
                      key = "@@WeakMap@@" + CreateUUID();
                  while (HashMap.has(keys, key));
                  keys[key] = true;
                  return key;
              }
              function GetOrCreateWeakMapTable(target, create) {
                  if (!hasOwn.call(target, rootKey)) {
                      if (!create)
                          return undefined;
                      Object.defineProperty(target, rootKey, { value: HashMap.create() });
                  }
                  return target[rootKey];
              }
              function FillRandomBytes(buffer, size) {
                  for (var i = 0; i < size; ++i)
                      buffer[i] = Math.random() * 0xff | 0;
                  return buffer;
              }
              function GenRandomBytes(size) {
                  if (typeof Uint8Array === "function") {
                      if (typeof crypto !== "undefined")
                          return crypto.getRandomValues(new Uint8Array(size));
                      if (typeof msCrypto !== "undefined")
                          return msCrypto.getRandomValues(new Uint8Array(size));
                      return FillRandomBytes(new Uint8Array(size), size);
                  }
                  return FillRandomBytes(new Array(size), size);
              }
              function CreateUUID() {
                  var data = GenRandomBytes(UUID_SIZE);
                  // mark as random - RFC 4122 § 4.4
                  data[6] = data[6] & 0x4f | 0x40;
                  data[8] = data[8] & 0xbf | 0x80;
                  var result = "";
                  for (var offset = 0; offset < UUID_SIZE; ++offset) {
                      var byte = data[offset];
                      if (offset === 4 || offset === 6 || offset === 8)
                          result += "-";
                      if (byte < 16)
                          result += "0";
                      result += byte.toString(16).toLowerCase();
                  }
                  return result;
              }
          }
          // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
          function MakeDictionary(obj) {
              obj.__ = undefined;
              delete obj.__;
              return obj;
          }
      });
  })(Reflect$1 || (Reflect$1 = {}));

  //todo: (revisar) usando solo como tipo DBtype no compila usando el decorador @columna({dbType: DBtype.TEXT)
  //Se une al tipo DBtype el tipo any como solucion temporal
  function column(colData) {
      return function (target, propName) {
          var dbType;
          var propType = Reflect.getMetadata('design:type', target, propName);
          target.constructor.columns = target.constructor.columns || [];
          //todo: de la misma forma que se añade una propiedad "columns" al constructor del modelo
          //se podria añadir una funcion "hasMany()" usando un decorator para definir relaciones entre modelos
          //Por ejemplo @hasMany()Post podria generar target.constructor.hasMany([Post])
          if (propType) {
              dbType = getDBTypeFromPropType(propType.name);
          }
          else {
              throw new InvalidPropTypeError(propType);
          }
          target.constructor.columns.push(new Column({
              name: propName,
              dbType: (colData && colData.dbType) || dbType,
              size: colData && colData.size,
              unique: colData && colData.unique,
              notNullable: colData && colData.notNullable,
              index: colData && colData.index
          }));
      };
  }
  /**
   * Maps javascript model prop type to SQLite column type.
   *
   * Type correspondence:
   * ---------------------------------
   * Javascript type	  SQLite type
   * ---------------------------------
   * number	            REAL, INTEGER
   * boolean            INTEGER
   * string	            TEXT
   * Array              Uint8Array BLOB
   * null	              NULL
   * ----------------------------------
   * Ref.: https://www.sqlite.org/datatype3.html
   *
   * @param jsPropType JavaScript type
   * @return DBtype SQLite type
   */
  function getDBTypeFromPropType(jsPropType) {
      jsPropType = jsPropType && jsPropType.toLowerCase();
      var result;
      if (jsPropType === 'string') {
          result = "varchar" /* STRING */;
      }
      else if (jsPropType === 'number') {
          result = "integer" /* INTEGER */;
      }
      else if (jsPropType === 'null') {
          result = "null" /* NULL */;
      }
      else {
          throw new InvalidPropTypeError(jsPropType);
      }
      return result;
  }

  //todo: actualizar dependencias rollup y typescript
  (function (DBtype) {
      DBtype["INTEGER"] = "integer";
      DBtype["REAL"] = "real";
      DBtype["BOOLEAN"] = "integer";
      DBtype["STRING"] = "varchar";
      DBtype["TEXT"] = "text";
      DBtype["DATE"] = "varchar";
      DBtype["BLOB"] = "blob";
      DBtype["NULL"] = "null"; // null is reserved word
  })(exports.DBtype || (exports.DBtype = {}));

  exports.loadDbFromFile = loadDbFromFile;
  exports.saveDbToFile = saveDbToFile;
  exports.Model = Model;
  exports.Collection = Collection;
  exports.Column = Column;
  exports.column = column;
  exports.getDBTypeFromPropType = getDBTypeFromPropType;
  exports.NotSavedModelError = NotSavedModelError;
  exports.InvalidPropTypeError = InvalidPropTypeError;
  exports.InvalidColumnData = InvalidColumnData;
  exports.getUrlParameter = getUrlParameter;
  exports.updateQueryStringParameter = updateQueryStringParameter;
  exports.disableConsole = disableConsole;
  exports.LOG_FORMAT = LOG_FORMAT;
  exports.logQuery = logQuery;
  exports.log = log;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=metaphasejs.umd.js.map
