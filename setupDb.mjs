import mysql from "mysql2/promise";
import MitiAccount from "miti-account";
import MitiAuth from "miti-auth";
import MitiSettings from "miti-settings";

import { TableRows, UserType } from "./config.mjs";

import dotenv from "dotenv";
dotenv.config();

const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
const mysqlConfigFirst = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "",
};

(async () => {
  let mysqlPool;
  let con;

  let account;
  let auth;
  try {
    //con = await mysql.createConnection(mysqlConfigFirst);
    //await con.query(`CREATE DATABASE mapi;`);
    mysqlPool = await mysql.createPool(mysqlConfig);
    auth = new MitiAuth(mysqlPool, new MitiSettings(UserType, TableRows));
    await auth.setupDatabase();
    account = new MitiAccount(
      mysqlPool,
      auth,
      new MitiSettings(UserType, TableRows)
    );
    auth.register(process.env.ROOT_LOG, process.env.ROOT_PASS, UserType.FUSER);
    await account.setupDatabase();
    console.log("Done");
  } catch (e) {
    console.error("An error occurred:", e);
  } finally {
    // Close your connections or do any other necessary cleanup here
    if (con) {
      await con.end();
    }
    if (mysqlPool) {
      mysqlPool.end();
    }
    // Exit the Node.js process
    process.exit(0);
  }
})();
