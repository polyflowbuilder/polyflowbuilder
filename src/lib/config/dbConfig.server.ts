import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';
import type { Pool } from 'mysql2/promise';

let conPool: Pool | null = null;

async function initDBPool(): Promise<void> {
  conPool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    connectionLimit: Number(env.DB_CONNECTION_POOL_LIMT),
    // see https://github.com/sidorares/node-mysql2/issues/875
    // flag documentation: https://github.com/mysqljs/mysql#connection-flags
    flags: ['-FOUND_ROWS']
  });

  //   log(
  //     'info',
  //     LoggerSenderType.DB_CONFIG,
  //     'Database pool successfully created, waiting for connection to establish ...'
  //   );
  console.log('Database pool successfully created, waiting for connection to establish ...');

  const conn = await conPool.getConnection();
  conn.release();

  //   log('info', LoggerSenderType.DB_CONFIG, 'Database connection successfully established');
  console.log('Database connection successfully established');
}

export { initDBPool, conPool };
