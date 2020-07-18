const db = require('../../config/db')

module.exports = {
  all() {
    db.query{
      return db.query(`
        SELECT * 
        FROM categories
      `)
    }
  }
}