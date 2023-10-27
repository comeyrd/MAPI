// Import modules using ES6 syntax
import express from "express";
import mitiAccount from "miti-account";
import mitiAuth from "miti-auth";
import mitiSettings from "miti-settings";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import { TableRows, UserType } from "./config.mjs";

import dotenv from "dotenv";
dotenv.config();
const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
let mitiSett = new mitiSettings(UserType, TableRows);
let mysqlPool = await mysql.createPool(mysqlConfig);
let auth = new mitiAuth(mysqlPool, mitiSett);
let account = new mitiAccount(mysqlPool, auth, mitiSett);

const app = express();
app.use(bodyParser.json());
const port = 8101;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); //TOFIX IN PROD
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const token = await auth.login(login, password, UserType.FUSER);
    console.log("user :" + login + " tried to log in");
    res.status(200).json({ Response: "Ok", data: { token: token } });
  } catch (error) {
    let status = 500;
    if (error == auth.USER_DONT_EXISTS) {
      status = 404;
    }
    res
      .status(status)
      .json({ Response: "Error", data: { type: error.message } });
    console.log(error.message);
  }
});

app.post("/register", async (req, res) => {
  const { login, password, token } = req.body;
  try {
    const decoded = await auth.checkJWT(token);
    console.log("create account from" + decoded.userId);
    const newtoken = await auth.register(login, password, UserType.FUSER);
    res.status(200).json({ Response: "Ok", data: { token: newtoken } });
  } catch (error) {
    res.status(500).json({ Response: "Error", data: { type: error.message } });
  }
});

app.get("/", async (req, res) => {
  // Respond with a JSON object
  res.json({ message: "Hello, World!" });
});

app.post("/delete", async (req, res) => {
  const { token } = req.body;
  try {
    await auth.delete(token);
    res
      .status(200)
      .json({ Response: "Ok", data: { Message: "Account Deleted" } });
  } catch (error) {
    res
      .status(500)
      .json({ Response: "Error", data: { Message: error.message } });
  }
});
app.post("/logout", async (req, res) => {
  const { token } = req.body;
  try {
    const newtoken = await auth.logout(token);
    res.status(200).json({ Response: "Ok", data: { token: newtoken } });
  } catch (error) {
    res
      .status(500)
      .json({ Response: "Error", data: { Message: error.message } });
  }
});
app.post("/update", async (req, res) => {
  const { token, login, password } = req.body;
  try {
    const newtoken = await auth.update(token, login, password);
    res.status(200).json({ Response: "Ok", data: { token: newtoken } });
  } catch (error) {
    res
      .status(500)
      .json({ Response: "Error", data: { Message: error.message } });
  }
});
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
