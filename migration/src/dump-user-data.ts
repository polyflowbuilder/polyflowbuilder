// utility script to dump data from existing prod db so we can migrate it to new db

import fs from 'fs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

let conPool: Pool | null = null;

let userIdCursor = 0;
const USER_DATA_BATCH_LIMIT = 10;

function initEnv() {
  dotenv.config({
    path: `${process.cwd()}/../../.env`
  });
  // now check to make sure they're actually loaded and exit otherwise
  if (!process.env['DOMAIN']) {
    console.log('ENVIRONMENT VARIABLES FAILED TO LOAD! Exiting ...');
    process.exit(-1);
  }

  console.log('environment variables successfully loaded');
}

async function initDB() {
  conPool = mysql.createPool({
    host: process.env['MIGRATION_DB_HOST'],
    user: process.env['MIGRATION_DB_USER'],
    password: process.env['MIGRATION_DB_PASS'],
    database: process.env['MIGRATION_DB_NAME'],
    connectionLimit: 10,
    // see https://github.com/sidorares/node-mysql2/issues/875
    // flag documentation: https://github.com/mysqljs/mysql#connection-flags
    flags: ['-FOUND_ROWS']
  });

  const conn = await conPool.getConnection();
  conn.release();

  console.log('database connection successfully established');
}

// fetch users in batches so that we don't crash on a single request w many users
async function getUserDataBatch() {
  const sqlQuery = `SELECT * FROM ${process.env['MIGRATION_DB_TABLE_USERS']} WHERE id > ? LIMIT ?`;

  if (!conPool) {
    throw new Error('DB connection not valid');
  }

  const res = (await conPool.query(sqlQuery, [userIdCursor, USER_DATA_BATCH_LIMIT])) as [
    RowDataPacket[],
    FieldPacket[]
  ];

  userIdCursor = res[0].at(-1)?.id;

  if (!userIdCursor) {
    console.log('finish fetching users');
    return [];
  }

  console.log(`fetched ${res[0].length} users (cursor now ${userIdCursor})`);

  return res[0];
}

async function dumpUserData() {
  initEnv();
  await initDB();

  console.log('starting dump-user-data');

  let userData = await getUserDataBatch();

  while (userData.length) {
    // save user data
    for (const user of userData) {
      console.log('  writing data for user', user.username);
      delete user.password;
      fs.writeFileSync(`../data/dump/${user.username}.json`, JSON.stringify(user, null, 2));
    }

    userData = await getUserDataBatch();
  }

  process.exit();
}

dumpUserData();
