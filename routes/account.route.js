const express = require("express");
const accountRouter = express.Router();

const accountsController = require("../controllers/account.controller");
const auth = require("../middlewares/auth.middleware");

accountRouter.post('/login', accountsController.login);
accountRouter.post('/signup', accountsController.signup);

module.exports = accountRouter;