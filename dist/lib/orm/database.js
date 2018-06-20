"use strict";
//todo: usar whatg-fetch en lugar de fetch para compatibilidad navegador (?)
Object.defineProperty(exports, "__esModule", { value: true });
var sql = require('sql.js');
var yago_logger_1 = require("./yago.logger");
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
    yago_logger_1.logQuery(queryString, 'query');
    return exports.db.run(queryString);
};
exports.db.__proto__.execQuery = function (query, useLogger) {
    if (useLogger === void 0) { useLogger = true; }
    useLogger && yago_logger_1.logQuery(query.toString(), 'query');
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
exports.loadDbFromFile = function (fileNamePath, actionFn) {
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
exports.saveDbToFile = function (fileNamePath) {
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
//# sourceMappingURL=database.js.map