import express from "express";
import mongoose from "mongoose";
import User from "../models/user";
import atob from "atob";
import bcrypt from "bcrypt";
import redis from "redis";

const router = express.Router();
const saltRounds = 12;
const redisClient = redis.createClient();

router.get("/", (req, res, next) => {
  console.log("Logando sessao ID");
  console.log(req.session);
  req.session.teste = "CHAVE TESTE";

  let query = {};
  let queryLogin = {};
  let queryEmail = {};

  if (req.query.login !== undefined) {
    queryLogin = { login: req.query.login };
    Object.assign(query, queryLogin);
  }
  if (req.query.email !== undefined) {
    queryEmail = { email: req.query.email };
    Object.assign(query, queryEmail);
  }

  User.find(query)
    .exec()
    .then(users => {
      if (users.length > 0) {
        users.forEach(user => {
          user.password = "************";
        });

        res.status(200).json(users);
        return;
      }
      res.status(404).send();
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.patch("/:id", (req, res, next) => {
  const id = req.params.id;
  const props = req.body;
  User.updateOne({ _id: id }, props)
    .exec()
    .then(result => {
      console.log(result);

      if (result.ok == 0) {
        res.status(400).json({ error: "Not a valid user" });
        return;
      }

      if (result.n > 0) {
        res.status(204).send();
      } else {
        res.status(404).send();
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  User.deleteOne({ _id: id })
    .exec()
    .then(result => {
      if (result.n > 0 && result.ok > 0) {
        res.status(204).send();
      } else {
        res.status(404).send();
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(req.session);
  User.findById(id)
    .exec()
    .then(user => {
      if (user) {
        user.password = "************";
        res.status(200).json(user);
        return;
      }
      res.status(404).send();
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", (req, res, next) => {
  const authorization = req.get("Authorization");
  console.log(authorization);
  if (!authorization) {
    res.status(400).json({ error: "Invalid Credentials" });
    return;
  }

  const decodedAuthorizathion = atob(authorization.substring(6));
  const credentials = decodedAuthorizathion.split(":");
  const login = credentials[0];
  const password = credentials[1];
  req.body.password = password;
  req.body.login = login;

  Promise.all([validateEmail(req), validateLogin(login)])
    .then(result => {
      let validationsErrors = [];
      result.forEach(error => {
        if (error !== undefined) validationsErrors.push(error);
      });

      if (validationsErrors.length > 0) {
        res.status(400).json({ error: validationsErrors });
      } else {
        saveUser(req, res);
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

function saveUser(req, res) {
  bcrypt.hash(req.body.password, saltRounds).then(function(hashedPassword) {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      login: req.body.login,
      email: req.body.email,
      name: req.body.name,
      lastName: req.body.lastName,
      password: hashedPassword,
      age: req.body.age,
      createdAt: new Date().toJSON(),
      updatedAt: null
    });

    user
      .save()
      .then(result => {
        user.password = user.password = "***********";
        res.status(201).json(user);
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
}

function validateEmail(req) {
  return new Promise(resolve => {
    User.findOne({ email: req.body.email })
      .exec()
      .then(user => {
        if (user) {
          resolve("Email is already used");
        }
        resolve();
      })
      .catch(err => {
        resolve(err);
      });
  });
}

function validateLogin(login) {
  return new Promise(resolve => {
    User.findOne({ login: login })
      .exec()
      .then(user => {
        if (user) {
          resolve("Login is already used");
        }
        resolve();
      })
      .catch(err => {
        resolve(err);
      });
  });
}

module.exports = router;
