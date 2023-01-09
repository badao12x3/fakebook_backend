const express = require("express");
const accountRouter = express.Router();

const accountsController = require("../controllers/account.controller");
const auth = require("../middlewares/auth.middleware");

accountRouter.post("/login", accountsController.login);
accountRouter.post("/signup", accountsController.signup);
accountRouter.post("/set_accept_friend", accountsController.set_accept_friend);
accountRouter.post(
  "/set_request_friend",
  accountsController.set_request_friend
);
accountRouter.get(
  "/get_requested_friends",
  accountsController.get_requested_friends
);
module.exports = accountRouter;
