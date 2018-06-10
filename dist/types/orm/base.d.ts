export declare abstract class Base {
    protected model: any;
    tableName(): string;
    protected insert(model?: any): number | string;
    protected update(model?: any): number | string;
    save(model?: any): number | string;
    remove(model?: any): number;
}
