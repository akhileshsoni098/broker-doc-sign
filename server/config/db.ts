import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "~~/server/models";

/*
|--------------------------------------------------------------------------
| Proper Typed Drizzle Instance
|--------------------------------------------------------------------------
*/

let db:
  ReturnType<
    typeof drizzle<typeof schema>
  >;

/*
|--------------------------------------------------------------------------
| Connect Database
|--------------------------------------------------------------------------
*/

export const connectDB = async () => {

  /*
  |--------------------------------------------------------------------------
  | Reuse Existing Connection
  |--------------------------------------------------------------------------
  */

  if (db) {
    return db;
  }

  const config =
    useRuntimeConfig();

  const {
    dbHost,
    dbPort,
    dbUser,
    dbPassword,
    dbName,
  } = config;

  /*
  |--------------------------------------------------------------------------
  | STEP 1
  | Connect default postgres database
  | to check/create target DB
  |--------------------------------------------------------------------------
  */

const adminPool = new Pool({
  host: dbHost,

  port: Number(dbPort),

  user: dbUser,

  password: dbPassword,

  // IMPORTANT
  database: "postgres",
});
 
  try {

    const checkDB =
      await adminPool.query(
        `
        SELECT 1
        FROM pg_database
        WHERE datname = $1
        `,
        [dbName]
      );

    if (
      checkDB.rowCount === 0
    ) {

      console.log(
        `Creating database: ${dbName}`
      );

      await adminPool.query(
        `CREATE DATABASE "${dbName}"`
      );

      console.log(
        `Database Created`
      );

    } else {

      console.log(
        `Database Already Exists`
      );
    }

  } catch (error) {

    console.error(
      "Database Creation Error:",
      error
    );

  } finally {

    await adminPool.end();
  }

  /*
  |--------------------------------------------------------------------------
  | STEP 2
  | Connect Target Database
  |--------------------------------------------------------------------------
  */

  const pool =
    new Pool({
      host: dbHost,

      port:
        Number(dbPort),

      user: dbUser,

      password:
        dbPassword,

      database: dbName,

      // ssl: {
      //   rejectUnauthorized:
      //     false,
      // },

      max: 20,

      idleTimeoutMillis:
        30000,

      connectionTimeoutMillis:
        5000,
    }); 


  /*
  |--------------------------------------------------------------------------
  | Pool Events
  |--------------------------------------------------------------------------
  */

  pool.on("connect", () => {

    console.log(
      "PostgreSQL Connected"
    );
  });

  pool.on("error", (err) => {

    console.error(
      "PostgreSQL Error:",
      err
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Create Typed Drizzle Instance
  |--------------------------------------------------------------------------
  */

  db = drizzle(pool, {
    schema,
  });

  return db;
};