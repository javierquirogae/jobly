"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Job = require("../models/job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: 0.5,
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 100000,
          equity: 0.5,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob);
    expect(resp.statusCode).toEqual(401);
  });
}
);

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 100000,
              equity: "0.1",
              companyHandle: "c1",
            },
            {
              id: expect.any(Number),
              title: "j2",
              salary: 200000,
              equity: "0.2",
              companyHandle: "c2",
            },
            {
              id: expect.any(Number),
              title: "j3",
              salary: 300000,
              equity: null,
              companyHandle: "c3",
            },
          ],
    });
  });

  test("works: filtering on title", async function () {
    const resp = await request(app)
        .get("/jobs")
        .query({ title: "j1" });
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 100000,
              equity: "0.1",
              companyHandle: "c1",
            },
          ],
    });
  });

  test("works: filtering on minSalary", async function () {
    const resp = await request(app)
        .get("/jobs")
        .query({ minSalary: 200000 });
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j2",
              salary: 200000,
              equity: "0.2",
              companyHandle: "c2",
            },
            {
              id: expect.any(Number),
              title: "j3",
              salary: 300000,
              equity: null,
              companyHandle: "c3",
            },
          ],
    });
  });

  test("works: filtering on hasEquity", async function () {
    const resp = await request(app)
        .get("/jobs")
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 100000,
              equity: "0.1",
              companyHandle: "c1",
            },
            {
              id: expect.any(Number),
              title: "j2",
              salary: 200000,
              equity: "0.2",
              companyHandle: "c2",
            },
          ],
    });
  });

  test("works: filtering on all three filters", async function () {
    const resp = await request(app)
        .get("/jobs")
        .query({ title: "j", minSalary: 200000, hasEquity: true });
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j2",
              salary: 200000,
              equity: "0.2",
              companyHandle: "c2",
            },
          ],
    });
  }
  );

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
        .get("/jobs")
        .query({ invalid: "nope" });
    expect(resp.statusCode).toEqual(400);
  }
  );
}
);

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app).get(`/jobs/${job.id}`);
    expect(resp.body).toEqual({
      job:
          {
            id: job.id,
            title: "j1",
            salary: 100000,
            equity: "0.1",
            companyHandle: "c1",
          },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
}
);

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .patch(`/jobs/${job.id}`)
        .send({
          title: "j-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job:
          {
            id: job.id,
            title: "j-new",
            salary: 100000,
            equity: "0.1",
            companyHandle: "c1",
          },
    });
  });

  test("unauth for non-admin", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .patch(`/jobs/${job.id}`)
        .send({
          title: "j-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .patch(`/jobs/${job.id}`)
        .send({
          id: 0,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .patch(`/jobs/${job.id}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
}
);

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .delete(`/jobs/${job.id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: `${job.id}` });
  });

  test("unauth for non-admin", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .delete(`/jobs/${job.id}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
}
);

/************************************** POST /jobs/:id/apply */

describe("POST /jobs/:id/apply", function () {
  test("works for anon", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .post(`/jobs/${job.id}/apply`)
        .send({
          username: "u1",
        });
    expect(resp.body).toEqual({ applied: `${job.id}` });
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .post(`/jobs/0/apply`)
        .send({
          username: "u1",
        });
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const job = await Job.findOne({ title: "j1" });
    const resp = await request(app)
        .post(`/jobs/${job.id}/apply`)
        .send({
          username: 42,
        });
    expect(resp.statusCode).toEqual(400);
  });
}
);



 




