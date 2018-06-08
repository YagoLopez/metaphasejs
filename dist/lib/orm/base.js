"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("./database");
var query_builder_1 = require("./query.builder");
var yago_logger_1 = require("./yago.logger");
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
        query_builder_1.query.insert(model).into(this.tableName()).run();
        model.id = database_1.db.getIdLastRecordInserted();
        return model.id;
    };
    Base.prototype.update = function (model) {
        query_builder_1.query.table(this.tableName()).update(model).where('id', model.id).run();
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
        (idModelSaved > 0) && yago_logger_1.logQuery("Saved " + model.constructor.name + " with id: " + idModelSaved, 'result');
        return idModelSaved;
    };
    Base.prototype.remove = function (model) {
        model = model || this;
        var deleteQuery = "delete from " + this.tableName() + " where id=" + model.id;
        database_1.db.run(deleteQuery);
        yago_logger_1.logQuery(deleteQuery, 'query');
        yago_logger_1.logQuery("Deleted " + this.constructor.name + " with id: " + model.id, 'result');
        return model.id;
    };
    return Base;
}());
exports.Base = Base;
//# sourceMappingURL=base.js.map