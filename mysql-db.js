require("dotenv").config();
const mysql = require("mysql2");

let connectionPool;

const self = (module.exports = {
  connect() {
    return new Promise((resolve, reject) => {
      connectionPool = mysql.createPool({
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_NAME,
        multipleStatements: true,
        namedPlaceholders: true,
      });
      connectionPool.query("select :x + :x as z", { x: 1 }, function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },
  query(query, params = {}) {
    return new Promise((resolve, reject) => {
      connectionPool.query(query, params, function (err, rows) {
        if (false) {
          console.log("");
          console.log("SQL QUERY : " + query);
          console.log("SQL PARAMS : " + JSON.stringify(params));
          console.log("");
        }
        if (err) {
          reject(err);
          return;
        }
        if (!Array.isArray(rows)) {
          resolve({ id: rows.insertId });
          return;
        }
        resolve(rows);
      });
    });
  },
  async findWhere({ table, where }) {
    const whereSentence = `WHERE ${Object.keys(where)
      .map((k) => `${k} = :${k}_where`)
      .join(" AND ")}`;

    const whereBindings = {};
    for (const k of Object.keys(where)) {
      whereBindings[`${k}_where`] = where[k].toString();
    }

    return await self.query(
      `SELECT * FROM ${table} ${whereSentence}`,
      whereBindings
    );
  },
  async findOneWhere({ table, where }) {
    return (await self.findWhere({ table, where })).at(0);
  },
  async insert({ table, fields }) {
    const keysSentence = Object.keys(fields).join(",");
    const valuesBindingsSentence = Object.keys(fields)
      .map((key) => `:${key}`)
      .join(",");
    return await self.query(
      `INSERT INTO ${table} (${keysSentence}) VALUES (${valuesBindingsSentence}) `,
      fields
    );
  },
  async update({ table, where, fields }) {
    const whereSentence = `WHERE ${Object.keys(where)
      .map((k) => `${k} = :${k}_where`)
      .join(" AND ")}`;

    const whereBindings = {};
    for (const k of Object.keys(where)) {
      whereBindings[`${k}_where`] = where[k].toString();
    }

    const setSentence = `SET ${Object.keys(fields)
      .map((k) => `${k} = :${k}`)
      .join(", ")}`;

    const updateQueryResponse = await self.query(
      `UPDATE ${table} ${setSentence} ${whereSentence}`,
      {
        ...whereBindings,
        ...fields,
      }
    );
    return updateQueryResponse;
  },
  async insertOrUpdate({ table, where, fields }) {
    const foundEntity = await self.findOneWhere({ table, where });
    let id;
    if (foundEntity) {
      id = foundEntity.id;
      // console.log("UPDATE");
      await self.update({ table, where, fields });
    } else {
      // console.log("INSERT");
      id = (await self.insert({ table, fields })).id;
    }
    return { id };
  },
});
