//todo: actualizar dependencias rollup y typescript
//todo: liberar memoria con close() al terminar
//todo: comentar funciones para que aparezcan en api doc
// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
export * from './orm/database'
export * from './orm/model'
export * from './orm/collection'
export * from './orm/column'
export * from './orm/decorators'
export * from './orm/exceptions'
export * from './orm/query.builder'
export * from './orm/yago.logger'

export enum DBtype {
  INTEGER = 'integer',
  REAL = 'real',
  BOOLEAN = 'integer', // SQLite does not admit boolean values natively
  STRING = 'varchar',
  TEXT = 'text',
  DATE = 'varchar',
  BLOB = 'blob',
  NULL = 'null' // null is reserved word
}
