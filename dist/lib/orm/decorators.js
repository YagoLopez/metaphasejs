import 'reflect-metadata';
import { Column } from './column';
import { InvalidPropTypeError } from './exceptions';
//todo: (revisar) usando solo como tipo DBtype no compila usando el decorador @columna({dbType: DBtype.TEXT)
//Se une al tipo DBtype el tipo any como solucion temporal
export function column(colData) {
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
export function getDBTypeFromPropType(jsPropType) {
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
//# sourceMappingURL=decorators.js.map