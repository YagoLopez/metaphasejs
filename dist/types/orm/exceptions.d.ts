import { Model } from "./model";
export declare class NotSavedModelError extends Error {
    model: Model;
    relatedModel: Model;
    constructor(model: Model, relatedModel: Model);
}
export declare class InvalidPropTypeError extends Error {
    constructor(jsType?: string);
}
export declare class InvalidColumnData extends Error {
    constructor(columnData: string | undefined);
}
