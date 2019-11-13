var express = require("express");
var router = express.Router();
var model = require("../models/index");
var response = require("../response");
var secretKey = "ACS3T !dN";
var jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
var FCM = require("fcm-node");
var serverKey =
  "AAAAFPglOLU:APA91bE-dXyDZ8X_nrBYSvXMgcCrFa6ljJCnhwVX6XKVXP2EmSd7N48GmxcckdUSSEow8fe-JNwSWdPR7nwbXC7Fl-VQP8ayHxNlzNswSwoZsizaxC0UU6E74riRZBBg6NwRU1m_XDoe"; // put your server key here
var fcm = new FCM(serverKey);

// LOGIN
router.post("/login", function(req, res, next) {
  let dataLogin = {
    profileUser: null,
    profileJob: null,
    profileRole: null,
    profileMenu: null,
    profilePlant: null,
    profileZone: null
  };
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (!req.body.username) {
    response.error("Username cannot be empty!", [], res);
  }
  if (!req.body.password) {
    response.error("Password cannot be empty!", [], res);
  }
  if (!req.body.application_id) {
    response.error("Application cannot be empty!", [], res);
  }
  try {
    model.sequelize
      .query(
        "SELECT COUNT(1) AS count_user FROM [dbo].[users] WHERE is_active = 1 AND deleted = 0 AND username = $1",
        {
          bind: [req.body.username],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          if (result[0].count_user == 0) {
            response.error("Username not registered.", [], res);
          } else {
            model.sequelize
              .query(
                "SELECT count(1) loggedIn FROM users_login ul inner join users u on u.id = ul.user_id  where u.username = $1 and ul.application_id = $2",
                {
                  bind: [req.body.username, req.body.application_id],
                  type: model.sequelize.QueryTypes.SELECT
                }
              )
              .then(
                checkUser => {
                  if (checkUser[0].loggedIn > 0) {
                    response.error(
                      "Your account is still logged in on another device.",
                      [],
                      res
                    );
                  } else {
                    model.sequelize
                      .query(
                        "SELECT id, username, full_name, gender, email, no_handphone, is_active, deleted FROM [dbo].[users] WHERE is_active = 1 AND deleted = 0 AND username = $1 AND password = CONVERT(VARCHAR(32), HashBytes('MD5', $2 ), 2)",
                        {
                          bind: [req.body.username, req.body.password],
                          type: model.sequelize.QueryTypes.SELECT
                        }
                      )
                      .then(result2 => {
                        if (result2.length == 0) {
                          model.sequelize
                            .query(
                              "update users set count_wrong_password = count_wrong_password + 1, is_active = CASE WHEN count_wrong_password = 2 THEN 0 ELSE 1 END where username = $1",
                              {
                                bind: [req.body.username],
                                type: model.sequelize.QueryTypes.UPDATE
                              }
                            )
                            .then(updatePass => {
                              response.error(
                                "Your password is incorrect.",
                                [],
                                res
                              );
                            });
                        } else {
                          dataLogin.profileUser = result2;
                          model.sequelize
                            .query(
                              "SELECT DISTINCT j.id, j.job_code, j.job_desc FROM [dbo].[users] u INNER JOIN [dbo].[users_jobs] uj ON u.id = uj.user_id INNER JOIN [dbo].[jobs] j ON j.id = uj.job_id WHERE u.is_active = 1 AND u.deleted = 0 AND uj.is_active = 1 AND uj.deleted = 0 AND j.is_active = 1 AND j.deleted = 0 AND u.username = $1 AND u.password = CONVERT(VARCHAR(32), HashBytes('MD5', $2), 2)",
                              {
                                bind: [req.body.username, req.body.password],
                                type: model.sequelize.QueryTypes.SELECT
                              }
                            )
                            .then(
                              result3 => {
                                model.sequelize
                                  .query(
                                    "UPDATE users SET count_wrong_password = 0 WHERE username = $1",
                                    {
                                      bind: [req.body.username],
                                      type: model.sequelize.QueryTypes.UPDATE
                                    }
                                  )
                                  .then(resetWrongPass => {
                                    dataLogin.profileJob = result3;
                                    model.sequelize
                                      .query(
                                        "SELECT DISTINCT r.id, r.role_code, r.role_desc FROM [dbo].[users] u INNER JOIN [dbo].[users_jobs] uj ON u.id = uj.user_id INNER JOIN [dbo].[jobs] j ON j.id = uj.job_id INNER JOIN [dbo].[roles_jobs] rj ON RJ.job_id = j.id INNER JOIN [dbo].[roles] r ON r.id = rj.role_id WHERE u.is_active = 1 AND u.deleted = 0 AND uj.is_active = 1 AND uj.deleted = 0 AND j.is_active = 1 AND j.deleted = 0 AND rj.is_active = 1 AND rj.deleted = 0 AND r.is_active = 1 AND r.deleted = 0 AND u.username = $1 AND u.password = CONVERT(VARCHAR(32), HashBytes('MD5', $2), 2)",
                                        {
                                          bind: [
                                            req.body.username,
                                            req.body.password
                                          ],
                                          type:
                                            model.sequelize.QueryTypes.SELECT
                                        }
                                      )
                                      .then(
                                        result4 => {
                                          dataLogin.profileRole = result4;
                                          model.sequelize
                                            .query(
                                              "SELECT DISTINCT a.id, a.application_name, a.application_type, a.route, a.icon FROM [dbo].[users] u INNER JOIN [dbo].[users_jobs] uj ON u.id = uj.user_id INNER JOIN [dbo].[jobs] j ON j.id = uj.job_id INNER JOIN [dbo].[roles_jobs] rj ON RJ.job_id = j.id INNER JOIN [dbo].[roles] r ON r.id = rj.role_id INNER JOIN [dbo].[applications_roles] ar ON ar.role_id = r.id INNER JOIN [dbo].[applications] a ON ar.application_id = a.id WHERE u.is_active = 1 AND u.deleted = 0 AND uj.is_active = 1 AND uj.deleted = 0 AND j.is_active = 1 AND j.deleted = 0 AND rj.is_active = 1 AND rj.deleted = 0 AND r.is_active = 1 AND r.deleted = 0 AND ar.is_active = 1 AND ar.deleted = 0 AND a.is_active = 1 AND a.deleted = 0 AND u.username = $1 AND u.password = CONVERT ( VARCHAR ( 32 ), HashBytes ( 'MD5', $2 ), 2 ) AND a.application_id = $3",
                                              {
                                                bind: [
                                                  req.body.username,
                                                  req.body.password,
                                                  req.body.application_id
                                                ],
                                                type:
                                                  model.sequelize.QueryTypes
                                                    .SELECT
                                              }
                                            )
                                            .then(
                                              result5 => {
                                                dataLogin.profileMenu = result5;
                                                // user project
                                                model.sequelize
                                                  .query(
                                                    "SELECT DISTINCT up.plant_code, up.project_name FROM users_projects up INNER JOIN users u ON up.user_id = u.id WHERE up.is_active = 1 AND up.deleted = 0 AND u.is_active = 1 AND u.deleted = 0 AND u.username = $1",
                                                    {
                                                      bind: [req.body.username],
                                                      type:
                                                        model.sequelize
                                                          .QueryTypes.SELECT
                                                    }
                                                  )
                                                  .then(
                                                    userProject => {
                                                      dataLogin.profilePlant = userProject;
                                                      // user zone
                                                      model.sequelize
                                                        .query(
                                                          "SELECT a.plant_code, a.zone_id FROM user_project_zone a INNER JOIN users b on a.user_id = b.id WHERE a.is_active = 1 AND a.deleted = 0 AND b.is_active = 1 AND b.deleted = 0 AND b.username = $1",
                                                          {
                                                            bind: [
                                                              req.body.username
                                                            ],
                                                            type:
                                                              model.sequelize
                                                                .QueryTypes
                                                                .SELECT
                                                          }
                                                        )
                                                        .then(
                                                          userZone => {
                                                            dataLogin.profileZone = userZone;

                                                            model.sequelize
                                                              .query(
                                                                "INSERT INTO [dbo].[history_login] ([user_id] ,[application_id] ,[ip_addr]) VALUES ($1 ,$2 ,$3)",
                                                                {
                                                                  bind: [
                                                                    result2[0]
                                                                      .id,
                                                                    req.body
                                                                      .application_id,
                                                                    ipAddr
                                                                  ],
                                                                  type:
                                                                    model
                                                                      .sequelize
                                                                      .QueryTypes
                                                                      .INSERT
                                                                }
                                                              )
                                                              .then(
                                                                result6 => {
                                                                  model.sequelize
                                                                    .query(
                                                                      "DELETE FROM [dbo].[users_login] WHERE user_id = $1 AND application_id = $2",
                                                                      {
                                                                        bind: [
                                                                          result2[0]
                                                                            .id,
                                                                          req
                                                                            .body
                                                                            .application_id
                                                                        ],
                                                                        type:
                                                                          model
                                                                            .sequelize
                                                                            .QueryTypes
                                                                            .DELETE
                                                                      }
                                                                    )
                                                                    .then(
                                                                      result7 => {
                                                                        model.sequelize
                                                                          .query(
                                                                            "INSERT INTO [dbo].[users_login] ([user_id] ,[application_id] ,[token_fcm] ,[created_by] ,[ip_addr]) VALUES ($1 ,$2 ,$3 ,$4 ,$5)",
                                                                            {
                                                                              bind: [
                                                                                result2[0]
                                                                                  .id,
                                                                                req
                                                                                  .body
                                                                                  .application_id,
                                                                                req
                                                                                  .body
                                                                                  .token_fcm,
                                                                                req
                                                                                  .body
                                                                                  .username,
                                                                                ipAddr
                                                                              ],
                                                                              type:
                                                                                model
                                                                                  .sequelize
                                                                                  .QueryTypes
                                                                                  .INSERT
                                                                            }
                                                                          )
                                                                          .then(
                                                                            result8 => {
                                                                              response.ok(
                                                                                "Login success",
                                                                                dataLogin,
                                                                                res
                                                                              );
                                                                            },
                                                                            error => {
                                                                              response.error(
                                                                                "Error while insert users_login.",
                                                                                error,
                                                                                res
                                                                              );
                                                                            }
                                                                          );
                                                                      },
                                                                      error => {
                                                                        response.error(
                                                                          "Error while clean user login.",
                                                                          error,
                                                                          res
                                                                        );
                                                                      }
                                                                    );
                                                                },
                                                                error => {
                                                                  response.error(
                                                                    "Error while insert history_login.",
                                                                    error,
                                                                    res
                                                                  );
                                                                }
                                                              );
                                                          },
                                                          error => {
                                                            response.error(
                                                              "Error while get users zone.",
                                                              error,
                                                              res
                                                            );
                                                          }
                                                        );
                                                      // end user zone
                                                    },
                                                    error => {
                                                      response.error(
                                                        "Error while insert users_login.",
                                                        error,
                                                        res
                                                      );
                                                    }
                                                  );
                                                // end user project
                                              },
                                              error => {
                                                response.error(
                                                  "Error while get profile menu.",
                                                  error,
                                                  res
                                                );
                                              }
                                            );
                                        },
                                        error => {
                                          response.error(
                                            "Error while get profile role.",
                                            error,
                                            res
                                          );
                                        }
                                      );
                                  });
                              },
                              error => {
                                response.error(
                                  "Error while get profile job.",
                                  error,
                                  res
                                );
                              }
                            );
                        }
                      });
                  }
                },
                error => {
                  response.error("Error while login.", error, res);
                }
              );
          }
        },
        error => {
          response.error("Error while find user.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while login.", error, res);
  }
});

/* GET users listing. */
router.get("/", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT id, username, full_name, gender, email, no_handphone, is_active, deleted FROM [dbo].[users] WHERE deleted = 0",
        {
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List users.", result, res);
        },
        error => {
          response.error("Error while get list user.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list user.", error, res);
  }
});

// POST users
router.post("/", function(req, res, next) {
  let transporter = nodemailer.createTransport({
    host: "mail.acset.co",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "notification-master@acset.co",
      pass: "Vfr45tgB$%"
    }
  });
  try {
    model.sequelize
      .query(
        "INSERT INTO [dbo].[users] ([username] ,[full_name] ,[gender] ,[email] ,[no_handphone] ,[password] ,[created_by] ,[ip_addr]) VALUES ($1 ,$2 ,$3 ,$4 ,$5 ,CONVERT(VARCHAR(32), HashBytes('MD5', $6 ), 2) ,$7 ,$8)",
        {
          bind: [
            req.body.username,
            req.body.full_name,
            req.body.gender,
            req.body.email,
            req.body.no_handphone,
            req.body.password,
            req.body.created_by,
            req.headers["x-forwarded-for"] || req.connection.remoteAddress
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          transporter.sendMail({
            from: '"[NO-REPLY] ACSET" <notification-master@acset.co>', // sender address
            to: req.body.email, // list of receivers
            subject: "[REGISTRATION SUCCESS]", // Subject line
            text: "User Login", // plain text body
            html:
              "<p>Kepada Yth,</p> <p><b>" +
              req.body.full_name +
              "</b></p> <br/> <p>Bersama ini kami kirimkan username & password Anda.</p> <p align='center'><b>USERNAME: " +
              req.body.username +
              "</b></p><p align='center'><b>PASSWORD: " +
              req.body.password +
              "</b></p> <p>Password yang dikirimkan ini dihasilkan oleh sistem dan bersifat rahasia, jaga baik-baik agar tidak diketahui orang lain.</p> <br/> <p>Terima Kasih,</p> <p>PT. ACSET Indonusa TBK.</p>" // html body
          });
          response.ok("Add users success.", result, res);
        },
        error => {
          response.error("Error while add user.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while add user.", error, res);
  }
});

// Logout
router.post("/logout", function(req, res, next) {
  try {
    model.sequelize
      .query(
        "DELETE FROM [dbo].[users_login] WHERE user_id = $1 AND application_id = $2",
        {
          bind: [req.body.id, req.body.application_id],
          type: model.sequelize.QueryTypes.DELETE
        }
      )
      .then(
        result => {
          response.ok("Logout success.", [], res);
        },
        error => {
          response.error("Error while logout.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while add user.", error, res);
  }
});

//Activated
router.post("/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users SET is_active = $1, count_wrong_password = case when is_active = 1 THEN count_wrong_password ELSE 0 END, updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated user success.", result, res);
        },
        error => {
          response.error("Error while activated user.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated user.", error, res);
  }
});

//Delete
router.post("/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete user success.", result, res);
        },
        error => {
          response.error("Error while delete user.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete user.", error, res);
  }
});

//Update user
router.post("/edit", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users SET full_name = $1, gender = $2, email = $3, no_handphone = $4, updated_by = $5, updated_date = getdate(), ip_addr = $6 WHERE id = $7",
        {
          bind: [
            req.body.full_name,
            req.body.gender,
            req.body.email,
            req.body.no_handphone,
            req.body.updated_by,
            ipAddr,
            req.body.id
          ],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Update user success.", result, res);
        },
        error => {
          response.error("Error while updated user.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while updated user.", error, res);
  }
});

//change password
router.post("/changePassword", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users SET updated_date = getdate(), updated_by = $1, ip_addr = $2, password = CONVERT(VARCHAR(32), HashBytes('MD5', $3 ), 2) WHERE id = $4",
        {
          bind: [req.body.updated_by, ipAddr, req.body.password, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Change password success.", result, res);
        },
        error => {
          response.error("Error while change password.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while change password.", error, res);
  }
});

// Get User Project
router.post("/project", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT up.id, u.username, u.full_name, up.plant_code, up.project_name, up.is_active, up.deleted FROM users_projects up INNER JOIN users u ON up.user_id = u.id WHERE up.deleted = 0 AND u.deleted = 0 AND up.plant_code = $1",
        {
          bind: [req.body.plant_code],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List user project.", result, res);
        },
        error => {
          response.error("Error while get list user project.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list user project.", error, res);
  }
});

// activated user job
router.post("/project/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users_projects SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated user project success.", result, res);
        },
        error => {
          response.error("Error while activated user project.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated user project.", error, res);
  }
});

//delete user job
router.post("/project/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE users_projects SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete user project success.", result, res);
        },
        error => {
          response.error("Error while delete user project.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete user project.", error, res);
  }
});

router.post("/project/add", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "INSERT INTO [dbo].[users_projects] ([user_id] ,[plant_code] ,[project_name] ,[created_by] ,[ip_addr]) VALUES ($1 ,$2 ,$3 ,$4 ,$5)",
        {
          bind: [
            req.body.user_id,
            req.body.plant_code,
            req.body.project_name,
            req.body.created_by,
            ipAddr
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Insert user project success.", result, res);
        },
        error => {
          response.error("Error while insert user project.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while insert user project.", error, res);
  }
});

//Get List User Project Zone
router.post("/project/zone", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT a.id, b.username, b.full_name, a.is_active, a.deleted FROM user_project_zone a INNER JOIN users b on a.user_id = b.id WHERE a.deleted = 0 AND b.deleted = 0 AND a.plant_code = $1 AND a.zone_id = $2",
        {
          bind: [req.body.plant_code, req.body.zone_id],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List User Project Zone.", result, res);
        },
        error => {
          response.error("Error while get List User Project Zone.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get List User Project Zone.", error, res);
  }
});

// Add user project zone
router.post("/project/zone/add", function(req, res, next) {
  try {
    model.sequelize
      .query(
        "INSERT INTO [dbo].[user_project_zone] ([plant_code] ,[zone_id] ,[user_id] ,[created_by] ,[ip_addr]) VALUES ($1 ,$2 ,$3 ,$4 ,$5)",
        {
          bind: [
            req.body.plant_code,
            req.body.zone_id,
            req.body.user_id,
            req.body.created_by,
            req.headers["x-forwarded-for"] || req.connection.remoteAddress
          ],
          type: model.sequelize.QueryTypes.INSERT
        }
      )
      .then(
        result => {
          response.ok("Add user project zone success.", result, res);
        },
        error => {
          response.error("Error while add user project zone.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while add user project zone.", error, res);
  }
});

// activated user job
router.post("/project/zone/activated", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE user_project_zone SET is_active = $1,updated_by = $2, ip_addr = $3, updated_date = getdate() WHERE id = $4",
        {
          bind: [req.body.is_active, req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Activated user project success.", result, res);
        },
        error => {
          response.error("Error while activated user project.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while activated user project.", error, res);
  }
});

//delete user job
router.post("/project/zone/delete", function(req, res, next) {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "UPDATE user_project_zone SET deleted = 1, updated_date = getdate(), updated_by = $1, ip_addr = $2 WHERE id = $3",
        {
          bind: [req.body.updated_by, ipAddr, req.body.id],
          type: model.sequelize.QueryTypes.UPDATE
        }
      )
      .then(
        result => {
          response.ok("Delete user project success.", result, res);
        },
        error => {
          response.error("Error while delete user project.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while delete user project.", error, res);
  }
});

//send push notification
router.post("/sendNotifications", function(req, res, next) {
  try {
    var message = {
      registration_ids: [
        "dCdgsW2kGWkxcM86YXXoK6:APA91bHEJmHuYiYM2vmSqIzODjFPFz3wT3nYLFOmfLmNsZwXszZjp6HckmcM81mToCSucTfBiM_4JmJLkcu7o_yPHv5xar9qxt5REOsWt2EPJTX4wCpVyWKV3KmEo2jSOZH-URRGNDla",
        "cbKxIl_TafJgp0GDoiyGjO:APA91bEYXVFDtOLaJVlB6222xG8eY9F60FNrySqcb_aUPb2DMhawd-GSsH6cAZCQAanvOWjuRvtADRaz6o9lSu7L-6WumSnTkkiDZz0hsLKnDnuKC95wFz-nkQWTPvWZaSAIRlUa_Q3N"
      ],
      collapse_key: "2",

      notification: {
        title: "E-Logistic",
        body: "New Request waiting approval!",
        icon: "http://172.16.57.82:3001/images/logo-acset.png"
      }
    };

    fcm.send(message, function(err, result) {
      if (err) {
        response.error("Error while send push notification!", err, res);
      } else {
        response.ok("Push notifications success.", JSON.parse(result), res);
      }
    });
  } catch (error) {
    response.error("Error while send notifications", error, res);
  }
});

router.post("/sendNotificationsNewOrder", function(req, res, next) {
  try {
    model.sequelize
      .query(
        "SELECT b.token_fcm FROM user_project_zone a INNER JOIN users_login b on a.user_id = b.user_id WHERE b.application_id = 6 AND a.plant_code = $1 AND a.zone_id = $2",
        {
          bind: [req.body.plant_code, req.body.zone_id],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          let tokenFcm = [];
          result.forEach(element => {
            tokenFcm.push(element.token_fcm);
          });
          var message = {
            registration_ids: tokenFcm,
            collapse_key: "2",

            notification: {
              title: "E-Logistic",
              body: "Ner Request waiting approval!",
              icon: "http://172.16.57.82:3001/images/logo-acset.png",
              click_action: req.body.click_action
            }
          };

          fcm.send(message, function(err, resultFcm) {
            if (err) {
              response.error("Error while send push notification!", err, res);
            } else {
              response.ok(
                "Push notifications success.",
                JSON.parse(resultFcm),
                res
              );
            }
          });
        },
        error => {
          response.error("Error while get list roles.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while send notifications", error, res);
  }
});

router.post("/sendNotificationsApprove", function(req, res, next) {
  try {
    model.sequelize
      .query(
        "SELECT ul.token_fcm FROM roles r INNER JOIN roles_jobs rj on r.id = rj.role_id INNER JOIN users_jobs uj on uj.job_id = rj.job_id INNER JOIN users_projects up on up.user_id = uj.user_id INNER JOIN users_login ul on up.user_id = ul.user_id WHERE r.role_code = 'ADM_LGTK' AND r.deleted = 0 AND r.is_active = 1 AND rj.deleted = 0 AND rj.is_active = 1 AND uj.deleted = 0 AND uj.is_active = 1 AND up.deleted = 0 AND up.is_active =1 AND up.plant_code = $1 AND ul.application_id = 6",
        {
          bind: [req.body.plant_code],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          let tokenFcm = [];
          result.forEach(element => {
            tokenFcm.push(element.token_fcm);
          });
          var message = {
            registration_ids: tokenFcm,
            collapse_key: "2",

            notification: {
              title: "E-Logistic",
              body: "Ner Request waiting packing order!",
              icon: "http://172.16.57.82:3001/images/logo-acset.png",
              click_action: req.body.click_action
            }
          };

          fcm.send(message, function(err, resultFcm) {
            if (err) {
              response.error("Error while send push notification!", err, res);
            } else {
              response.ok(
                "Push notifications success.",
                JSON.parse(resultFcm),
                res
              );
            }
          });
        },
        error => {
          response.error("Error while get list roles.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while send notifications", error, res);
  }
});

router.post("/sendNotificationsDelivery", function(req, res, next) {
  try {
    model.sequelize
      .query(
        "select ul.token_fcm from users u inner join users_login ul on u.id = ul.user_id where u.deleted = 0 and u.is_active = 1 and ul.application_id = 6 and u.username = $1",
        {
          bind: [req.body.created_by],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          let tokenFcm = [];
          result.forEach(element => {
            tokenFcm.push(element.token_fcm);
          });
          var message = {
            registration_ids: tokenFcm,
            collapse_key: "2",

            notification: {
              title: "E-Logistic",
              body:
                "Request " +
                req.body.order_no +
                " in shipping, please recieve order after material arrived!",
              icon: "http://172.16.57.82:3001/images/logo-acset.png",
              click_action: req.body.click_action
            }
          };

          fcm.send(message, function(err, resultFcm) {
            if (err) {
              response.error("Error while send push notification!", err, res);
            } else {
              response.ok(
                "Push notifications success.",
                JSON.parse(resultFcm),
                res
              );
            }
          });
        },
        error => {
          response.error("Error while get list roles.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while send notifications", error, res);
  }
});

//Get Detail User
router.post("/detail", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT u.id, u.username, u.full_name, u.gender, u.email, u.no_handphone FROM users u WHERE u.is_active = 1 and u.deleted = 0 AND u.username = $1",
        {
          bind: [req.body.username],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("Detail user.", result, res);
        },
        error => {
          response.error("Error while get detail user.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get detail user.", error, res);
  }
});

/* GET list active login apps by user id. */
router.get("/loginApps/:userId", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "SELECT ul.id,u.username, u.full_name, ul.application_id, a.application_name, FORMAT(ul.created_date,'dd MMM yyyy HH:mm') login_date FROM users_login ul INNER JOIN applications a on ul.application_id = a.id INNER JOIN users u on u.id = ul.user_id WHERE ul.user_id = $1",
        {
          bind: [req.params.userId],
          type: model.sequelize.QueryTypes.SELECT
        }
      )
      .then(
        result => {
          response.ok("List active login apps by user id.", result, res);
        },
        error => {
          response.error("Error while get list active login apps by user id.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while get list active login apps by user id.", error, res);
  }
});

/* Logout users from apps. */
router.delete("/logout/:loginId", function(req, res, next) {
  try {
    // var plainObject = jwt.verify(req.headers["authorization"], secretKey);
    model.sequelize
      .query(
        "DELETE FROM users_login WHERE id = $1",
        {
          bind: [req.params.loginId],
          type: model.sequelize.QueryTypes.DELETE
        }
      )
      .then(
        result => {
          response.ok("Logout success!.", result, res);
        },
        error => {
          response.error("Error while logout users from app.", error, res);
        }
      );
  } catch (error) {
    response.error("Error while logout users from app2.", error, res);
  }
});

module.exports = router;
