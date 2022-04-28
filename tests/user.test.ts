import supertest from "supertest";
import app from "../src/app.js";
import { createBody } from "./factories/userFactory.js";
import { prisma } from "../src/database.js";

describe("POST /sign-in", () => {
  beforeAndAfterAll();
  it("should answer with status 200 when given valid credentials", async () => {
    const body = await createBody("existingUser");

    const response = await supertest(app).post("/sign-in").send(body);

    expect(response.status).toBe(200);
  });
  it("should answer with a valid token", async () => {
    const body = await createBody("existingUser");

    const response = await supertest(app).post("/sign-in").send(body);

    expect(response.body).not.toBe(null);
  });
  it("should answer with status 401 when given invalid credentials", async () => {
    const body = await createBody("newUser");

    const response = await supertest(app).post("/sign-in").send(body);

    expect(response.status).toBe(401);
  });
});

describe("POST /sign-up", () => {
  beforeAndAfterAll();
  it("should answer with status 201 when given valid body and persist the user", async () => {
    const body = await createBody("newUser");

    const response = await supertest(app).post("/sign-up").send(body);

    expect(response.status).toBe(201);

    const insertedUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    expect(insertedUser).not.toBe(null);
  });
  it("should return 422 given an invalid body", async () => {
    const body = {};

    const response = await supertest(app).post("/sign-up").send(body);

    expect(response.status).toBe(422);
  });

  it("should return 409 given an existing user", async () => {
    const body = await createBody("existingUser");

    const response = await supertest(app).post("/sign-up").send(body);

    expect(response.status).toBe(409);
  });
});

async function beforeAndAfterAll() {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE users;`;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });
}
