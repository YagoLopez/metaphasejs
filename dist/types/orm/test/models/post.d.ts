import { Model } from "../../model";
import { Column } from "../../column";
import { Comment } from "./comment";
export declare class Post extends Model {
    static columns: Column[];
    hasMany(): (typeof Comment)[];
}
