"use strict";
const fs = require("fs");
var log_file_err = fs.createWriteStream(__dirname + "/logs/error.log", {
  flags: "a"
});

exports.ok = function(message, data, res) {
  var result = {
    status: true,
    message: message ? message : null,
    data: data ? data : null
  };
  res.json(result);
  res.end();
};

exports.ok2 = function(status, message, data, resStatus, res) {
  var result = {
    status: status,
    message: message,
    data: data
  };
  res.status(resStatus);
  res.json(result);
  res.end();
};

exports.error = function(message, data, res) {
  let result1 = data;
  if (data.sql) {
    result1 = data.original.message;
  }
  var result = {
    status: false,
    message: message,
    data: result1
  };

  log_file_err.write(
    new Date() +
      "\n === " +
      message +
      " === \n " +
      JSON.stringify(data) +
      "\n === End " +
      message +
      " ===" +
      "\n\n"
  );
  res.json(result);
  res.end();
};
