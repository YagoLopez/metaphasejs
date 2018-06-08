import {Model} from "../../src/orm/model";
import {Column} from "../../src/orm/column";
import {DBtype} from "../../src/orm/types";
import {Comment} from "./comment"

export class Post extends Model {

  //todo: por defecto el tipo de columna deberia ser string (?)
  public static columns: Column[] = [
    new Column({name: 'title', dbType: DBtype.STRING}),
    new Column({name: 'content', dbType: DBtype.STRING}),
  ];

  hasMany () {
    return [Comment]
  }

}
