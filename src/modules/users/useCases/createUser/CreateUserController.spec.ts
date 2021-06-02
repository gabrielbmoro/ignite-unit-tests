import { app } from "../../../../app";

import request from "supertest";

import { Connection, createConnection } from "typeorm";
import { CreateUserError } from "./CreateUserError";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  it("should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "user test",
      password: "123",
      email: "user@test.com",
    });

    expect(response.status).toBe(201);
  });

  afterAll(async () => {
    await connection.query("delete from users");
    await connection.close();
  });
});
