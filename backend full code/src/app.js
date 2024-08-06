const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
// const httpStatus=require('http-status');
const routes = require("./routes/v1/index");
// const timeout = require("connect-timeout");

const app = express();
const { errorHandler } = require("./middlewares/errorHandler");

// # Dùng cors
app.use(cors());
app.options("*", cors()); // Cũng là chấp nhận request từ mọi url

// use body parser to parse the json request body
app.use(express.json());

// parse urlencoded request body : convert character that outside ASCII to form %
app.use(express.urlencoded({ extended: true }));

// use helmet to avoid some kind of by secure HTTP header
app.use(helmet());
app.get("/congrat", (req, res) => {
  res.sendFile("templates/template2.html", { root: __dirname });
});
app.get("/congratPayment", (req, res) => {
  res.sendFile("templates/paymentsuccess.html", { root: __dirname });
});

// use routes
app.use("/api/v1", routes);

// # Dùng express
app.all("*", (req, res, next) => { // All the another routes are not valid
  const err = new Error("The route can not be found");
  err.statusCode = 404;
  next(err);
});

// use error handler
app.use(errorHandler);
// export module
module.exports = app;
