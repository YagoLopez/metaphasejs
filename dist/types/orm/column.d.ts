import { DBtype } from './types';
import { TableBuilder } from 'knex';
export declare const enum ColumnAction {
    Cascade = "cascade",
    SetNull = "set null",
    SetDefault = "set default",
    Restrict = "restrict",
    NoAction = "no action"
}
export interface IColumn {
    name?: string;
    dbType?: DBtype | any;
    size?: number;
    foreignKey?: boolean;
    relatedTable?: string;
    unique?: boolean;
    defaultValue?: any;
    notNullable?: boolean;
    index?: boolean;
}
export declare class Column implements IColumn {
    name?: string;
    dbType?: DBtype;
    size?: number;
    foreignKey?: boolean;
    relatedTable?: string;
    unique?: boolean;
    defaultValue?: any;
    notNullable?: boolean;
    index?: boolean;
    constructor({ name, size, dbType, foreignKey, relatedTable, unique, defaultValue, notNullable, index }: IColumn);
    /**
     * Creates foreign key relation between two columns in two tables
     * Column 1: primary key column ('id')
     * Column 2: foreign key column (<modelName>_id)
     * Table 1: table
     * Table 2: this.relatedTable
     * Note: ColumnAction = 'Cascade' by default. Not configurable by now
     * @param {knex.TableBuilder} table
     */
    createColumnsRelation(table: TableBuilder): void;
    /**
     * Create table columns based in column properties
     * @param {Knex.TableBuilder} table
     */
    createColumn(table: TableBuilder): any;
    private static addUniqueConstraint;
    private static addIndex;
    isForeignKey(): boolean;
}
