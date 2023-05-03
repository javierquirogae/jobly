"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { ensureLoggedInAsAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Job = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

router.get("/", async function (req, res, next) {
    try {
        const jobs = await Job.findAll();
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
}
);

router.post("/", ensureLoggedInAsAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.register(req.body);
        const token = createToken(job);
        return res.status(201).json({ job, token });
    } catch (err) {
        return next(err);
    }
}   
);

// Adding Filtering
// Similar to the companies filtering for the GET / route, add filtering for jobs for the following possible filters:

// title: filter by job title. Like before, this should be a case-insensitive, matches-any-part-of-string search.
// minSalary: filter to jobs with at least that salary.
// hasEquity: if true, filter to jobs that provide a non-zero amount of equity. If false or not included in the filtering, list all jobs regardless of equity.
// Write comprehensive tests for this, and document this feature well.

router.get("/", async function (req, res, next) {
    try {
        const jobs = await Job.filter(req.body);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
}
);


module.exports = router;