import { QueryBuilder } from 'knex';
/** **************************************************************************************************************
 * db.js API
 * Documentation:
 * http://kripken.github.io/sql.js/documentation/#http://kripken.github.io/sql.js/documentation/class/Database.html
 **************************************************************************************************************** */
export interface db {
    /**
     * Open a new database either by creating a new one or opening an existing one,
     * stored in the byte array passed in first argument
     * @param {number[]} data
     */
    constructor(data: number[]): void;
    /**
     * Set DB created from external file
     * @param {db} database
     */
    setDatabase(database: db): void;
    /**
     * Runs a database query that can be created by the query builder or by a sql query string.
     * It does not return a list of results. It returns a "db" database object for fn chaining
     * It wraps db.run()
     * @param {Object | string} query
     */
    runQuery(query: QueryBuilder | string): any;
    /**
     * Execute a query against database and returns an array of objects
     * It wraps db.exec()
     * @param {QueryBuilder} query object
     * @returns {Object[]} List of models
     */
    execQuery(query: QueryBuilder | string): Object[];
    /**
     * Get the results from a query and transform them into a list of POJOs
     * @param statement Prepared SQL statement
     * @returns {Object[]}
     */
    getResults(statement: any): Object[];
    /**
     * Check whether a table exists in the database
     * @param {string} tableName
     * @returns {boolean}
     */
    hasTable(tableName: string): boolean;
    /**
     * Check databse integrity (for posible errors and corruption)
     * @returns {Object[]} with integrity info
     */
    integrityCheck(): Object[];
    /**
     * Get DDL (Data Definition Language) queries
     * Useful for debugging purposes
     * @return {Object[]}
     */
    getSchema(): Object[];
    /**
     * Execute SQLite function
     * @param {string} fnExpression
     * @returns {any}
     */
    execFunction(fnExpression: string): any;
    /**
     * Get id of last record inserted in database
     * @return {number}
     */
    getIdLastRecordInserted(): number;
    run(sqlQuery: string, params?: object | any[]): db;
    exec(sqlQuery: string): Array<{
        columns: string[];
        values: any[];
    }>;
    prepare(sqlQuery: string, params?: object | any[]): Object;
    each(sqlQuery: string, callback: Function, done: Function, params?: object | any[]): db;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
    create_function(name: string, fn: Function): void;
}
/**
 * Database instance
 * @type {SQL} Global variable created by 'sql.js'
 */
export declare let db: any;
export declare const loadDbFromFile: (fileNamePath: string, actionFn: Function) => void;
export declare const saveDbToFile: (fileNamePath: string) => void;
