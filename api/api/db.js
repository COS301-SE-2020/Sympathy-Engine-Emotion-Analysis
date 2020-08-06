const { Pool } = require('pg');
const config = require('./config.json');

// cache db pool
let pool;
if (pool == null) {
  pool = new Pool({
    user: process.env.DB_USER || config.user,
    host: process.env.DB_HOST || config.host,
    database: process.env.DB_NAME || config.database,
    password: process.env.DB_PASS || config.password,
    port: process.env.DB_PORT || config.port
  });
}

module.exports = pool;