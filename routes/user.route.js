const usersController = require("../controllers/user.controller");

const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth.middleware");

userRouter.post('/login', usersController.login);
userRouter.post('/signup', usersController.signup);

module.exports = userRouter;