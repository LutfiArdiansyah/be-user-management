var express = require("express");
var router = express.Router();
var model = require("../models/index");
var response = require("../response");
var secretKey = "ACS3T !dN";
var jwt = require("jsonwebtoken");

// GET jobs
router.get("/", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT [id] ,[job_code] ,[job_desc] ,[is_active] ,[deleted] FROM [UserManagement].[dbo].[jobs] WHERE [deleted] = 0",
        {
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List jobs.", result, res);
        },
        error => {
          response.error("Error while get list job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list job.", error, res);
  }
});

// POST jobs
router.post("/", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    model.sequelize
      .query(
        "INSERT INTO jobs (job_code, job_desc, created_by, created_date, ip_addr) VALUES ($1, $2, $3, getdate(), $4)",
        {
          bind: [
            req.body.job_code,
            req.body.job_desc,
            req.body.created_by,
            ipAddr
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Add job success.", result, res);
        },
        error => {
          response.error("Error while add job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while add job.", error, res);
  }
});

router.post("/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE jobs SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated job success.", result, res);
        },
        error => {
          response.error("Error while activated job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated job.", error, res);
  }
});

router.post("/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE jobs SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete job success.", result, res);
        },
        error => {
          response.error("Error while delete job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete job.", error, res);
  }
});

router.post("/edit", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE jobs SET job_desc = $1, updated_by = $2, updated_date = getdate(), ip_addr = $3 WHERE id = $4",
        {
          bind: [req.body.job_desc, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Update job success.", result, res);
        },
        error => {
          response.error("Error while updated job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while updated job.", error, res);
  }
});

// GET users jobs
router.get("/users/:jobId", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT uj.id, u.username, j.job_code, j.job_desc, uj.is_active, uj.deleted FROM users_jobs uj INNER JOIN jobs j ON j.id = uj.job_id INNER JOIN users u ON u.id = uj.user_id WHERE uj.deleted = 0 AND j.deleted = 0 AND u.deleted = 0 AND j.id = $1",
        {
          bind: [req.params.jobId],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List users jobs.", result, res);
        },
        error => {
          response.error("Error while get list users jobs.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list users jobs.", error, res);
  }
});

router.post("/user", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "INSERT INTO [dbo].[users_jobs] ([user_id] ,[job_id] ,[created_by] ,[ip_addr]) VALUES ($1 ,$2 ,$3 ,$4)",
        {
          bind: [
            req.body.user_id,
            req.body.job_id,
            req.body.created_by,
            ipAddr
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Insert user job success.", result, res);
        },
        error => {
          response.error("Error while insert user job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while insert user job.", error, res);
  }
});

// activated user job
router.post("/user/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users_jobs SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated user job success.", result, res);
        },
        error => {
          response.error("Error while activated user job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated user job.", error, res);
  }
});

//delete user job
router.post("/user/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users_jobs SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete user job success.", result, res);
        },
        error => {
          response.error("Error while delete user job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete user job.", error, res);
  }
});

module.exports = router;
