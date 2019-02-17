import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("Sessao: ");
  console.log(req.session.id);
  const sessionKey = req.session.id;
  res.end();
});

module.exports = router;
