import 'reflect-metadata';
import { DBtype } from './types';
export declare function column(colData?: {
    dbType?: DBtype | any;
    size?: number;
    unique?: boolean;
    notNullable?: boolean;
    index?: boolean;
}): (target: any, propName: string) => void;
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
export declare function getDBTypeFromPropType(jsPropType?: string): DBtype;
