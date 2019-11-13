var express = require("express");
var router = express.Router();
var model = require("../models/index");
var response = require("../response");
var secretKey = "ACS3T !dN";
var jwt = require("jsonwebtoken");

// GET roles
router.get("/", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT [id] ,[role_code] ,[role_desc] ,[is_active] ,[deleted] FROM [UserManagement].[dbo].[roles] WHERE [deleted] = 0",
        {
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List roles.", result, res);
        },
        error => {
          response.error("Error while get list roles.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list roles.", error, res);
  }
});

// POST roles
router.post("/", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    model.sequelize
      .query(
        "INSERT INTO roles (role_code, role_desc, created_by, created_date, ip_addr) VALUES ($1, $2, $3, getdate(), $4)",
        {
          bind: [
            req.body.role_code,
            req.body.role_desc,
            req.body.created_by,
            ipAddr
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Add role success.", result, res);
        },
        error => {
          response.error("Error while add role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while add role.", error, res);
  }
});

// ACTIVATED
router.post("/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE roles SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated role success.", result, res);
        },
        error => {
          response.error("Error while activated role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated role.", error, res);
  }
});

//DELETED
router.post("/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE roles SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete role success.", result, res);
        },
        error => {
          response.error("Error while delete role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete role.", error, res);
  }
});

//UPDATE ROLE
router.post("/edit", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE roles SET role_desc = $1, updated_by = $2, updated_date = getdate(), ip_addr = $3 WHERE id = $4",
        {
          bind: [req.body.role_desc, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Update role success.", result, res);
        },
        error => {
          response.error("Error while updated role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while updated role.", error, res);
  }
});

// GET roles jobs
router.get("/job/:roleId", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT rj.id, j.job_desc, r.role_code, r.role_desc, rj.is_active, rj.deleted FROM roles_jobs rj INNER JOIN roles r ON r.id = rj.role_id INNER JOIN jobs j ON j.id = rj.job_id WHERE rj.deleted = 0 AND j.deleted = 0 AND r.deleted = 0 AND r.id = $1",
        {
          bind: [req.params.roleId],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List roles jobs.", result, res);
        },
        error => {
          response.error("Error while get list roles jobs.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list roles jobs.", error, res);
  }
});

//Add Role Job
router.post("/job", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "INSERT INTO [dbo].[roles_jobs] ([role_id] ,[job_id] ,[created_by] ,[ip_addr]) VALUES ($1 ,$2 ,$3 ,$4)",
        {
          bind: [
            req.body.role_id,
            req.body.job_id,
            req.body.created_by,
            ipAddr
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Insert role job success.", result, res);
        },
        error => {
          response.error("Error while insert role job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while insert role job.", error, res);
  }
});

// activated user job
router.post("/job/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE roles_jobs SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated role job success.", result, res);
        },
        error => {
          response.error("Error while activated role job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated role job.", error, res);
  }
});

//delete user job
router.post("/job/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE roles_jobs SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete role job success.", result, res);
        },
        error => {
          response.error("Error while delete role job.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete role job.", error, res);
  }
});

module.exports = router;
