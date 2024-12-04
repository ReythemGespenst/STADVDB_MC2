import 'dotenv/config';
const mysql = require('mysql');

module.exports = {
    con: mysql.createConnection
}