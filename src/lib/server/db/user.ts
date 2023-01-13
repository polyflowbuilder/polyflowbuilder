// CRUD operations regarding user data
import { env } from '$env/dynamic/private';
import { conPool } from '$lib/config/dbConfig.server';
import type { DBUserModel } from '$lib/types';
import type { FieldPacket, PoolConnection, RowDataPacket } from 'mysql2/promise';

export async function getUserByEmail(
  email: string,
  conn?: PoolConnection | undefined, // use this so we can use a single connection if the situation calls for it
  updateLoginDate = false
): Promise<DBUserModel | null> {
  const releaseConn = conn === undefined;
  const sqlQuery = `SELECT * FROM ${env.DB_TABLE_USERS} WHERE email = ?`;
  const sqlQuery2 = `UPDATE ${env.DB_TABLE_USERS} SET lastLoginDate = ? WHERE email = ?`;
  let userData = null;

  // TODO: reconsider cache
  //   if (userDataCache.has(email)) {
  //     log(
  //       'info',
  //       LoggerSenderType.DB_CONTROLLER_USER,
  //       'retrieved user data from cache for email',
  //       email
  //     );
  //     return userDataCache.get(email);
  //   }

  // get a connection from the pool if we don't have one
  conn = conn ? conn : await conPool.getConnection();

  // use prepared statements to prevent SQL injection attacks
  // result is [row, fields]
  const res = (await conn.execute(sqlQuery, [email])) as [RowDataPacket[], FieldPacket[]];

  if (res[0].length === 1) {
    userData = res[0][0] as DBUserModel;
  } else if (res[0].length > 1) {
    // TODO: have this logged
    throw new Error('User email lookup returned more than one user, aborting operation');
  }

  // TODO: reconsider cache
  //   if (userData) {
  //     // add to cache
  //     log(
  //       'info',
  //       LoggerSenderType.DB_CONTROLLER_USER,
  //       'user data successfully found and added to cache for user',
  //       email
  //     );
  //     userDataCache.set(email, userData);

  //     // update login
  //     if (updateLoginDate) {
  //       // TODO: do we need to await this?
  //       await conn.execute(sqlQuery2, [new Date(), email]);
  //     }
  //   }

  // update login
  if (updateLoginDate) {
    // TODO: do we need to await this?
    await conn.execute(sqlQuery2, [new Date(), email]);
  }

  // release if necessary
  if (releaseConn) {
    conn.release();
  }

  return userData;
}
