// Import modules using ES6 syntax
import express from "express";
import mitiAccount from "miti-account";
import mitiAuth from "miti-auth";
import mitiSettings from "miti-settings";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import { mitiObject } from "./config.mjs";
import util from "util";
import dotenv from "dotenv";
dotenv.config();
const adminType = mitiObject.FADMIN.id;
const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
let mitiSett = new mitiSettings(mitiObject);
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

const admined = async (req, res, next) => {
  const { token } = req.body;
  try {
    const decoded = await auth.checkJWT(token);
    if (decoded.type === adminType && decoded.userId) {
      req.authData = {
        type: decoded.type,
        id: decoded.userId,
      };
      next();
    }
  } catch (error) {
    res.status(200).json({
      Response: "Error",
      data: { type: "Auth Error", message: error.message },
    });
  }
};

app.post("/auth/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const token = await auth.login(login, password, adminType);
    res.status(200).json({
      Response: "Ok",
      data: { token: token, expiration: auth.jwtExpiration },
    });
  } catch (error) {
    res.status(200).json({ Response: "Error", data: { type: error.message } });
  }
});

app.post("/auth/validate", admined, async (req, res) => {
  const { id, type } = req.authData;

  res.status(200).json({
    Response: "Ok",
    data: { id: id, type: type },
  });
});

app.post("/auth/register", admined, async (req, res) => {
  const { create } = req.body;
  const { login, pass, info } = create;
  try {
    const newtoken = await auth.register(login, pass, adminType);
    await account.create(info, newtoken);
    res.status(200).json({
      Response: "Ok",
      data: {
        message: "Account Created",
        token: newtoken,
        expiration: auth.jwtExpiration,
      },
    });
  } catch (error) {
    res.status(500).json({ Response: "Error", data: { type: error.message } });
  }
});

app.get("/", async (req, res) => {
  // Respond with a JSON object
  res.json({
    message: "Fmapi Routes Available",
    routes: [
      {
        id: "/auth",
        routes: [
          { id: "/login", params: "login, password" },
          { id: "/validate", params: "token" },
          { id: "/logout", params: "token" },
          { id: "/update", params: "token, login, password" },
          { id: "/register", params: "login, password" },
        ],
      },
      {
        id: "/account",
        routes: [
          { id: "/get-info", params: "login, password" },
          { id: "/edit-info", params: "token" },
          { id: "/get-scheme", params: "token" },
        ],
      },
    ],
  });
});

app.post("/account/get-info", admined, async (req, res) => {
  const { token } = req.body;
  const uInfo = await account.read(token);
  const jsonResponse = {
    Response: "Ok",
    data: {
      uInfo,
    },
  };
  res.status(200).json(jsonResponse);
});

app.post("/auth/edit-info", admined, async (req, res) => {
  const { token, infoObj } = req.body;
  try {
    await account.update(infoObj, token);
    res.status(200).json({
      Response: "Ok",
      data: { infoObj },
    });
  } catch (error) {
    res.status(500).json({ Response: "Error", data: { type: error.message } });
  }
});

app.post("/account/get-scheme", admined, async (req, res) => {
  const { token } = req.body;
  const scheme = await account.getScheme(token);
  const jsonResponse = {
    Response: "Ok",
    data: {
      scheme,
    },
  };
  res.status(200).json(jsonResponse);
});

app.post("/auth/delete", async (req, res) => {
  const { token } = req.body;
  try {
    await account.delete(token);
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

app.post("/auth/logout", async (req, res) => {
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

app.post("/auth/update", async (req, res) => {
  const { token, login, password } = req.body;
  try {
    await auth.update(token, login, password);
    res.status(200).json({ Response: "Ok", data: { message: "Info Updated" } });
  } catch (error) {
    res
      .status(500)
      .json({ Response: "Error", data: { Message: error.message } });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

function showObj(obj) {
  console.log(util.inspect(obj, { depth: null }));
}
export { app };
