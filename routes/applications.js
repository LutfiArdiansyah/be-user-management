var express = require("express");
var router = express.Router();
var model = require("../models/index");
var response = require("../response");
var secretKey = "ACS3T !dN";
var jwt = require("jsonwebtoken");

// GET applications
router.get("/", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT [id] ,[application_name] ,[application_type] ,[parent_id] ,[application_id] ,[is_active] ,[deleted] FROM [UserManagement].[dbo].[applications] WHERE [deleted] = 0 AND [application_type] = 1",
        {
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List applications.", result, res);
        },
        error => {
          response.error("Error while get list applications.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list applications.", error, res);
  }
});

// POST application
router.post("/", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    model.sequelize
      .query(
        "INSERT INTO applications (application_name, application_type, created_by, created_date, ip_addr) VALUES ($1, $2, $3, getdate(), $4)",
        {
          bind: [req.body.application_name, 1, req.body.created_by, ipAddr],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Add application success.", result, res);
        },
        error => {
          response.error("Error while add application.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while add application.", error, res);
  }
});

//UPDATE Application
router.post("/edit", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE applications SET application_name = $1, updated_by = $2, updated_date = getdate(), ip_addr = $3 WHERE id = $4",
        {
          bind: [
            req.body.application_name,
            req.body.updated_by,
            ipAddr,
            req.body.id
          ],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Update application success.", result, res);
        },
        error => {
          response.error("Error while updated application.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while updated application.", error, res);
  }
});

// GET menu by application id
router.get("/:applicationId", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT id, application_name, route, icon, application_type, parent_id, application_id, is_active, deleted FROM applications WHERE deleted = 0 AND application_id = $1",
        {
          bind: [req.params.applicationId],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List application menu.", result, res);
        },
        error => {
          response.error("Error while get list application menu.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list application menu.", error, res);
  }
});

// POST add menu
router.post("/addMenu", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    model.sequelize
      .query(
        "INSERT INTO applications (application_name, application_type, parent_id, application_id, route, icon, created_by, ip_addr) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        {
          bind: [
            req.body.application_name,
            2,
            req.body.parent_id,
            req.body.application_id,
            req.body.route,
            req.body.icon,
            req.body.created_by,
            ipAddr
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Add menu success.", result, res);
        },
        error => {
          response.error("Error while add menu.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while add menu.", error, res);
  }
});

// ACTIVATED
router.post("/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE applications SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated menu success.", result, res);
        },
        error => {
          response.error("Error while activated menu.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated menu.", error, res);
  }
});

//DELETED
router.post("/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE applications SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete menu success.", result, res);
        },
        error => {
          response.error("Error while delete menu.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete menu.", error, res);
  }
});

//UPDATE MENU
router.post("/editMenu", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE applications SET application_name = $1, route = $2, icon = $3, updated_by = $4, ip_addr = $5, updated_date = GETDATE() WHERE id = $6",
        {
          bind: [
            req.body.application_name,
            req.body.route,
            req.body.icon,
            req.body.updated_by,
            ipAddr,
            req.body.id
          ],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Update menu success.", result, res);
        },
        error => {
          response.error("Error while updated menu.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while updated menu.", error, res);
  }
});

// GET application role
router.get("/role/:applicationId", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT ar.id, r.role_code, r.role_desc, ar.is_active, ar.deleted FROM applications_roles ar INNER JOIN roles r on ar.role_id = r.id WHERE ar.deleted = 0 AND ar.application_id = $1",
        {
          bind: [req.params.applicationId],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List application role.", result, res);
        },
        error => {
          response.error("Error while get list application role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list application role.", error, res);
  }
});

//Add Application Role
router.post("/role", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "INSERT INTO [dbo].[applications_roles] ([application_id] ,[role_id] ,[created_by] ,[ip_addr]) VALUES ($1 ,$2 ,$3 ,$4)",
        {
          bind: [
            req.body.application_id,
            req.body.role_id,
            req.body.created_by,
            ipAddr
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Insert application role success.", result, res);
        },
        error => {
          response.error("Error while insert application role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while insert application role.", error, res);
  }
});

// ACTIVATED APP ROLE
router.post("/role/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE applications_roles SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated app role success.", result, res);
        },
        error => {
          response.error("Error while activated app role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated app role.", error, res);
  }
});

//DELETED APP ROLE
router.post("/role/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE applications_roles SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete app role success.", result, res);
        },
        error => {
          response.error("Error while delete app role.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete app role.", error, res);
  }
});

module.exports = router;
