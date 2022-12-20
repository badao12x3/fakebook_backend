const accountsController = require("../controllers/account.controller");

const express = require("express");
const accountRouter = express.Router();
const auth = require("../middlewares/auth.middleware");

accountRouter.post('/login', accountsController.login);
accountRouter.post('/signup', accountsController.signup);

module.exports = accountRouter;