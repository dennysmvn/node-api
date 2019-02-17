import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import usersRouter from "./routes/users";
import indexRouter from "./routes/index";
import session from "express-session";
import connectRedis from "connect-redis";
import redis from "redis";
import "./respositories/mongo";

const app = express();

const redisClient = redis.createClient();
const Redistore = connectRedis(session);

redisClient.on("error", err => {
  console.log("[REDIS] - Could not establish a connection " + err);
});

redisClient.on("connect", () => {
  console.log("[REDIS] - Connected to redis successfully");
});

app.use(
  session({
    store: new Redistore({
      client: redisClient
    }),
    secret: "gamefiller",
    resave: false,
    saveUninitialized: false
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable("x-powered-by");
app.use(cookieParser());

//Routers
app.use("/users", usersRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
