const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitor.controller");

router.post("/", visitorController.create);
router.get("/count", visitorController.count);

module.exports = router;
