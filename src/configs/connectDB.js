require('dotenv').config()

const QueryBuilder = require('node-querybuilder')
const settings = {
  host: process.env.HOST_DB,
  database: process.env.NAME_DB,
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
}
const pool = new QueryBuilder(settings, 'mysql', 'pool')

module.exports = pool
