import { Base } from "./base";
import { Model } from "./model";
/**
 * Manages a collection of models (rows in a db table)
 * It follows Repository pattern
 */
export declare class Collection extends Base {
    protected model: any;
    constructor(model: any);
    private createTable;
    private createColumns;
    /**
     * Given an array of pojos it returns an array of model instances
     * @param {Object[]} pojos (Plain Old Javascript Object)
     * @returns {Object[]}
     */
    createModelInstances(pojos: Object[]): Model[];
    getAll(load?: {
        children: boolean;
    }): Model[];
    getById(id: string | number, load?: {
        children: boolean;
    }): Model;
    getByFilter(filter: Object, columns?: string[], load?: {
        children: boolean;
    }): Model[];
    getByOperator(termA: any, operator: string, termB: any, columns?: string[], load?: {
        children: boolean;
    }): Model[];
    private hasRelations;
    private createColumnRelation;
    private createRelations;
    /**
     * Get table structure and metadata for a model
     * @param modelClass
     * @returns {Object[]} Column metadata
     */
    static getTableSchema(modelClass: any): Object[];
    /**
     * Get Knex query-builder for this collection/table
     * @returns {any}
     */
    query(): any;
    /**
     * Returns table schema with column metadata
     * @param {string} tableName
     * @param {string} columnName
     * @returns {boolean}
     */
    static hasColumn(tableName: string, columnName: string): boolean;
    /**
     * For posible future use
     * Deletes the table corresponding to the collection
     * @param {"string"} tableName
     */
    static deleteTable(tableName: string): void;
}
