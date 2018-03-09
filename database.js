'use strict';

const { Client } = require('pg');
var database = process.env.DATABASE || 'ita_dev';
var db_password = process.env.DB_PASSWORD || 'root';
var db_user = process.env.DB_USER || 'postgres';
var db_host = process.env.DB_HOST || '192.168.2.174';
var db_port = process.env.DB_PORT || '5432';

// database configuration
const client = new Client({
  host: db_host,
  port: db_port,
  user: db_user,
  database: database,
  password: db_password,
});

// connect to database
client.connect((err) => {
  if (err) {
    console.error('connection error', err);
    // server.close();
  } else {
    console.log(' databse connected');
  }
});

module.exports = client;
