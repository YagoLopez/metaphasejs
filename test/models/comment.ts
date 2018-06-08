import {Model} from "../../src/orm/model";
import {Column} from "../../src/orm/column";
import {DBtype} from "../../src/orm/types";

export class Comment extends Model {

  public static columns: Column[] = [
    new Column({name: 'author', dbType: DBtype.STRING}),
    new Column({name: 'date', dbType: DBtype.STRING})
  ];

}
