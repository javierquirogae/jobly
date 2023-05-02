"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");

let db;

if (process.env.NODE_ENV === "test") {
  db = new Client({
    host: "/var/run/postgresql/",
    database: "jobly_test"
  });
} else {
  db = new Client({
    host: "/var/run/postgresql/",
    database: "jobly"
  });
}


db.connect();

module.exports = db;