"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 100,
        equity: 0.1,
        companyHandle: "c1",
    };
    
    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
        id: expect.any(Number),
        title: "new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        });
    
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE title = 'new'`);
        expect(result.rows).toEqual([
        {
            id: expect.any(Number),
            title: "new",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1",
        },
        ]);
    });
    });

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: "j1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1",
        },
        {
            id: expect.any(Number),
            title: "j2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c2",
        },
        {
            id: expect.any(Number),
            title: "j3",
            salary: 300,
            equity: null,
            companyHandle: "c3",
        },
        ]);
    });
    }
    );


/************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get(1);
        expect(job).toEqual({
        id: 1,
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        });
    });
    
    test("not found if no such job", async function () {
        try {
        await Job.get(0);
        fail();
        } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    }
    );

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "New",
        salary: 500,
        equity: 0.5,
    };
    
    test("works", async function () {
        let job = await Job.update(1, updateData);
        expect(job).toEqual({
        id: 1,
        companyHandle: "c1",
        ...updateData,
        });
    
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = 1`);
        expect(result.rows).toEqual([{
        id: 1,
        companyHandle: "c1",
        ...updateData,
        }]);
    });
    
    test("works: null fields", async function () {
        const updateDataSetNulls = {
        title: "New",
        salary: null,
        equity: null,
        };
    
        let job = await Job.update(1, updateDataSetNulls);
        expect(job).toEqual({
        id: 1,
        companyHandle: "c1",
        ...updateDataSetNulls,
        });
    
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = 1`);
        expect(result.rows).toEqual([{
        id: 1,
        companyHandle: "c1",
        ...updateDataSetNulls,
        }]);
    });
    
    test("not found if no such job", async function () {
        try {
        await Job.update(0, {
            title: "test",
        });
        fail();
        } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    
    test("bad request with no data", async function () {
        expect.assertions(1);
        try {
        await Job.update(1, {});
        fail();
        } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
    }
    );

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Job.remove(1);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id=1");
        expect(res.rows.length).toEqual(0);
    });
    
    test("not found if no such job", async function () {
        try {
        await Job.remove(0);
        fail();
        } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    }
    );


/************************************** filter */

describe("filter", function () {
    test("works: all filters", async function () {
        let jobs = await Job.filter({ title: "j", minSalary: 150, hasEquity: true });
        expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: "j2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c2",
        },
        ]);
    });
    
    test("works: title filter", async function () {
        let jobs = await Job.filter({ title: "j" });
        expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: "j1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1",
        },
        {
            id: expect.any(Number),
            title: "j2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c2",
        },
        {
            id: expect.any(Number),
            title: "j3",
            salary: 300,
            equity: null,
            companyHandle: "c3",
        },
        ]);
    });
    
    test("works: minSalary filter", async function () {
        let jobs = await Job.filter({ minSalary: 150 });
        expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: "j2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c2",
        },
        {
            id: expect.any(Number),
            title: "j3",
            salary: 300,
            equity: null,
            companyHandle: "c3",
        },
        ]);
    });
    
    test("works: hasEquity filter", async function () {
        let jobs = await Job.filter({ hasEquity: true });
        expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: "j1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1",
        },
        {
            id: expect.any(Number),
            title: "j2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c2",
        },
        ]);
    });
    
    test("works: all filters", async function () {
        let jobs = await Job.filter
        ({ title: "j", minSalary: 150, hasEquity: true });
        expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: "j2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c2",
        },
        ]);
    });

    test("works: no filter", async function () {
        let jobs = await Job.filter({});
        expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: "j1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1",
        },
        {
            id: expect.any(Number),
            title: "j2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c2",
        },
        {
            id: expect.any(Number),
            title: "j3",
            salary: 300,
            equity: null,
            companyHandle: "c3",
        },
        ]);
    }
    );
    }
    );
    
