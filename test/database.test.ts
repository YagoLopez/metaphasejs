import {db} from "../src/orm/database";
import {Collection} from "../src/orm/collection";
import {User} from "./models/user";

const users = new Collection(User);
const user1 = new User({name: "user1", age: 11, admin: 0});
const user2 = new User({name: "user2", age: 22, admin: 0});
user1.save();

describe('Database Module', () => {

  test('execQuery()', () => {
    const result = db.execQuery( users.query().where('name', 'user1' ));
    expect(result.length).toBe(1);
  });

  test('runQuery()', () => {
    const query = users.query().where('name', 'user1');
    const result = db.runQuery(query);
    expect(result).toBeInstanceOf(db.constructor);
  });

  test('integrityCheck()', () => {
    expect( db.integrityCheck()[0] ).toHaveProperty('integrity_check', 'ok');
  });

  test('getRowsModified()', () => {
    user2.save();
    expect( db.getRowsModified() ).toBe(1);
    user2.remove();
    expect( db.getRowsModified() ).toBe(1);
  });

  test('hasTable()', () => {
    expect( db.hasTable('users') ).toBeTruthy();
    expect( db.hasTable('inexistentTable') ).toBeFalsy();
  });

  test('getSchema()', () => {
    const expectedSchema = [
      {
        name: 'users',
        sql: 'CREATE TABLE `users` (`id` integer not null primary key autoincrement, `name` varchar(255), ' +
              '`age` integer not null, `admin` integer)'
      },
      {
        name: 'sqlite_sequence',
        sql: 'CREATE TABLE sqlite_sequence(name,seq)'
      }
    ];
    const actualSchema = db.getSchema();
    expect( actualSchema ).toEqual( expectedSchema );
  });

  test('getIdLastRecordInserted()', () => {
    user2.save();
    expect( db.getIdLastRecordInserted() ).toBe(2);
  });

  test('getResults()', () => {
    const sqlQueryExistingRecord = 'SELECT * FROM users WHERE name="user1"';
    expect( db.getResults(db.prepare(sqlQueryExistingRecord))[0] ).toEqual(user1);

    const sqlQueryUnexistingRecord = 'SELECT * FROM users WHERE name="unexistent user name"';
    expect( db.getResults(db.prepare(sqlQueryUnexistingRecord)).length ).toBe(0);
  });

  test('create_function()', () => {
    //todo:
  });


});

