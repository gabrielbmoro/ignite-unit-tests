import { app } from "../../../../app";

import request from "supertest";

import { hash } from "bcryptjs";

import { v4 as uuidV4 } from "uuid";

import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Create Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  it("should be able to authenticate a valid user", async () => {
    const userId = uuidV4();

    const userPassword = await hash("123", 8);

    await connection.query(
      ` insert into users(id, name, email, password, created_at, updated_at) values ('${userId}', 'Authentication', 'user@authentication.com','${userPassword}', 'now', 'now')`
    );

    const response = await request(app).post("/api/v1/sessions").send({
      name: "Testing Authentication",
      password: "123",
      email: "user@authentication.com",
    });

    const { token } = response.body;

    expect(token.length).toBeGreaterThan(0);
    expect(response.status).toBe(200);
  });

  it("should be not able to authenticate an invalid user password", async () => {
    const userId = uuidV4();

    const userPassword = await hash("123", 8);

    await connection.query(
      ` insert into users(id, name, email, password, created_at, updated_at) values ('${userId}', 'Authentication', 'user2@authentication.com','${userPassword}', 'now', 'now')`
    );

    const response = await request(app).post("/api/v1/sessions").send({
      name: "Testing Authentication",
      password: "1234",
      email: "user2@authentication.com",
    });

    expect(response.status).toBe(401);
  });

  it("should be not able to authenticate an invalid user email", async () => {
    const userId = uuidV4();

    const userPassword = await hash("123", 8);

    await connection.query(
      ` insert into users(id, name, email, password, created_at, updated_at) values ('${userId}', 'Authentication', 'user3@authentication.com','${userPassword}', 'now', 'now')`
    );

    const response = await request(app).post("/api/v1/sessions").send({
      name: "Testing Authentication",
      password: "123",
      email: "user4@authentication.com",
    });

    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    await connection.query("delete from users");
    await connection.close();
  });
});
