import { Model } from "./model";
export declare abstract class Base {
    protected model: Model;
    tableName(): string;
    protected insert(model?: any): number | string;
    protected update(model?: any): number | string;
    save(model?: any): number | string;
    remove(model?: any): number;
}
