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
accountRouter.post(
  "/get_requested_friends",
  accountsController.get_requested_friends
);
accountRouter.post(
  "/get_blocked_account",
  auth,
  accountsController.get_block_account
);
accountRouter.post(
  "/change_password",
  auth,
  accountsController.change_password
);
module.exports = accountRouter;
