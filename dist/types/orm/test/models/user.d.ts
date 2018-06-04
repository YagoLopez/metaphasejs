import { Model } from "../../model";
import { Column } from "../../column";
import { Post } from "./post";
export declare class User extends Model {
    /**
     * In Jest tests, Typescript decorators can not be used. Model properties (table columns) have to be
     * defined as 'Column' Classes
     * @type {[Column]} Columns array
     */
    static columns: Column[];
    hasMany(): (typeof Post)[];
}
