// Import modules using ES6 syntax
import { describe, it } from "vitest";
import { expect } from "chai";
import request from "supertest";
import { app } from "./index.mjs"; // Import your Express app
import dotenv from "dotenv";

dotenv.config();

describe("Express App Tests", () => {
  it("Login & Validate", async () => {
    const loginResp = await request(app)
      .post("/login")
      .send({ login: process.env.ROOT_LOG, password: process.env.ROOT_PASS });

    expect(loginResp.status).to.equal(200);
    expect(loginResp.body).to.have.property("Response", "Ok");
    expect(loginResp.body.data).to.have.property("token");

    const validateResp = await request(app)
      .post("/validate")
      .send({ token: loginResp.body.data.token });
    expect(validateResp.status).to.equal(200);
    expect(validateResp.body).to.have.property("Response", "Ok");
  });
  it("Register & Login & Validate & Delete", async () => {
    const log1 = "userReg";
    const pass1 = "passReg";
    const registerResp = await request(app)
      .post("/register")
      .send({ login: log1, password: pass1 });

    expect(registerResp.status).to.equal(200);
    expect(registerResp.body).to.have.property("Response", "Ok");

    const loginResp = await request(app)
      .post("/login")
      .send({ login: log1, password: pass1 });

    expect(loginResp.status).to.equal(200);
    expect(loginResp.body).to.have.property("Response", "Ok");
    expect(loginResp.body.data).to.have.property("token");

    const validateResp = await request(app)
      .post("/validate")
      .send({ token: loginResp.body.data.token });
    expect(validateResp.status).to.equal(200);
    expect(validateResp.body).to.have.property("Response", "Ok");

    const deleteResp = await request(app)
      .post("/delete")
      .send({ token: loginResp.body.data.token });

    expect(deleteResp.status).to.equal(200);
    expect(deleteResp.body).to.have.property("Response", "Ok");
  });
  it("Register & Login & Validate & Update & Login & Validate & Delete", async () => {
    const log1 = "userReg";
    const pass1 = "passReg";
    const pass2 = "passReg2";

    const registerResp = await request(app)
      .post("/register")
      .send({ login: log1, password: pass1 });

    expect(registerResp.status).to.equal(200);
    expect(registerResp.body).to.have.property("Response", "Ok");

    const loginResp = await request(app)
      .post("/login")
      .send({ login: log1, password: pass1 });

    expect(loginResp.status).to.equal(200);
    expect(loginResp.body).to.have.property("Response", "Ok");
    expect(loginResp.body.data).to.have.property("token");

    const validateResp = await request(app)
      .post("/validate")
      .send({ token: loginResp.body.data.token });
    expect(validateResp.status).to.equal(200);
    expect(validateResp.body).to.have.property("Response", "Ok");

    const updateResp = await request(app)
      .post("/update")
      .send({ login: log1, password: pass2, token: loginResp.body.data.token });
    expect(updateResp.status).to.equal(200);
    expect(updateResp.body).to.have.property("Response", "Ok");

    const login2Resp = await request(app)
      .post("/login")
      .send({ login: log1, password: pass2 });

    expect(login2Resp.status).to.equal(200);
    expect(login2Resp.body).to.have.property("Response", "Ok");
    expect(login2Resp.body.data).to.have.property("token");

    const deleteResp = await request(app)
      .post("/delete")
      .send({ token: loginResp.body.data.token });
    expect(deleteResp.status).to.equal(200);
    expect(deleteResp.body).to.have.property("Response", "Ok");

    const login3Resp = await request(app)
      .post("/login")
      .send({ login: log1, password: pass2 });
    expect(login3Resp.status).to.equal(200);
    expect(login3Resp.body).to.have.property("Response", "Error");
  });
  it("User doesnt exist", async () => {
    const log1 = "userReg";
    const pass1 = "passReg";

    const registerResp = await request(app)
      .post("/register")
      .send({ login: log1, password: pass1 });

    expect(registerResp.status).to.equal(200);
    expect(registerResp.body).to.have.property("Response", "Ok");

    const loginResp = await request(app)
      .post("/login")
      .send({ login: log1, password: pass1 });

    expect(loginResp.status).to.equal(200);
    expect(loginResp.body).to.have.property("Response", "Ok");
    expect(loginResp.body.data).to.have.property("token");

    const deleteResp = await request(app)
      .post("/delete")
      .send({ token: loginResp.body.data.token });
    expect(deleteResp.status).to.equal(200);
    expect(deleteResp.body).to.have.property("Response", "Ok");

    const validateResp = await request(app)
      .post("/validate")
      .send({ token: loginResp.body.data.token });
    expect(validateResp.status).to.equal(200);
    expect(validateResp.body).to.have.property("Response", "Error");
  });
  it("logging out", async () => {
    const log1 = "userReg";
    const pass1 = "passReg";

    const registerResp = await request(app)
      .post("/register")
      .send({ login: log1, password: pass1 });

    expect(registerResp.status).to.equal(200);
    expect(registerResp.body).to.have.property("Response", "Ok");

    const loginResp = await request(app)
      .post("/login")
      .send({ login: log1, password: pass1 });

    expect(loginResp.status).to.equal(200);
    expect(loginResp.body).to.have.property("Response", "Ok");
    expect(loginResp.body.data).to.have.property("token");

    const logout = await request(app)
      .post("/logout")
      .send({ token: loginResp.body.data.token });
    expect(logout.status).to.equal(200);
    expect(logout.body).to.have.property("Response", "Ok");

    const validateResp = await request(app)
      .post("/login")
      .send({ token: logout.body.data.token });
    expect(validateResp.status).to.equal(200);
    expect(validateResp.body).to.have.property("Response", "Error");

    const deleteResp = await request(app)
      .post("/delete")
      .send({ token: loginResp.body.data.token });
    expect(deleteResp.status).to.equal(200);
    expect(deleteResp.body).to.have.property("Response", "Ok");
  });
});
