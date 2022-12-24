const express = require("express");
const learnMongooseRouter = express.Router();

const learnMongoosesController = require('../controllers/learnMongoose.controller');
learnMongooseRouter.get("/getCountComments", learnMongoosesController.getCountComments);
module.exports = learnMongooseRouter;