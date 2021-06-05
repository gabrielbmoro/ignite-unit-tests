import { app } from "../../../../app";

import request from "supertest";

import { hash } from "bcryptjs";

import { v4 as uuidV4 } from "uuid";

import { Connection, createConnection } from "typeorm";
import { sign } from "jsonwebtoken";

import authConfig from "../../../../config/auth";

let connection: Connection;

describe("ShowUserProfileController", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  it("should be able to get the profile from a valid user", async () => {
    const userId = uuidV4();

    const userPassword = await hash("123", 8);

    await connection.query(
      ` insert into users(id, name, email, password, created_at, updated_at) values ('${userId}', 'Authentication', 'user5@authentication.com','${userPassword}', 'now', 'now')`
    );

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: userId,
      expiresIn,
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", "Bearer " + token);

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(200);
  });

  it("should be able to get the profile from an invalid user", async () => {
    const userId = uuidV4();

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: userId,
      expiresIn,
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", "Bearer " + token);

    expect(response.status).toBe(404);
  });

  afterAll(async () => {
    await connection.query(`delete from users`);
    await connection.close();
  });
});
