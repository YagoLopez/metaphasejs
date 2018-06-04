import "reflect-metadata";
import { DBtype } from "./types";
export declare function column(colData?: {
    dbType?: DBtype;
    size?: number;
    unique?: boolean;
    notNullable?: boolean;
    index?: boolean;
}): (target: any, propName: string) => void;
/**
 * Calculate SQLite type from javascript model prop type.
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
