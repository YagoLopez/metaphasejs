import { Base } from "./base";
export declare abstract class Model extends Base {
    [otherProps: string]: any;
    constructor(props?: Model | {});
    /**
     * Factory for model instance creation
     * @param {Object} pojo (plain old javascript object)
     * @param {any} modelClass
     * @returns {Model}
     */
    static create(pojo: Object, modelClass: any): Model;
    isSaved(): boolean;
    private getForeignKeyColumnName;
    belongsTo(model: Model): Model;
    getParent(model: any & Model): Model[];
    /**
     * Get first level related children models
     * @param model
     * @returns {Model[]}
     */
    getChildren(model: any & Model): Model[];
    /**
     * Get recursively all descendant models from this model
     */
    getChildrenAll(): void;
    /**
     * Makes related models properties not enumerable
     * Use: if a model is fetched with all related (or children) models
     * when this model is saved an error is thrown due to properties containing related models
     * are not original model properties
     * This function can be used to "hide" (not enumerate) these props and save the model
     * @param {Model} model
     * returns {Model}
     */
    static omitChildrenProps(model: any): Model;
    hasChildren(): boolean;
}
