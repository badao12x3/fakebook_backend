const express = require("express");
const accountRouter = express.Router();

const accountsController = require("../controllers/account.controller");
const auth = require("../middlewares/auth.middleware");
const uploadAvatarOrCoverImageMiddleware = require("../middlewares/uploadAvatarOrCoverImage.middleware");

accountRouter.post("/login", accountsController.login);
accountRouter.post("/signup", accountsController.signup);
accountRouter.post("/del_request_friend",auth, accountsController.del_request_friend);
accountRouter.post("/set_accept_friend",auth, accountsController.set_accept_friend);
accountRouter.post(
  "/set_request_friend",auth,
  accountsController.set_request_friend
);
accountRouter.post(
  "/get_requested_friends",auth,
  accountsController.get_requested_friends
);
accountRouter.get('/get_user_info', auth, accountsController.get_user_info);
accountRouter.post('/set_user_info',uploadAvatarOrCoverImageMiddleware, auth, accountsController.set_user_info);

module.exports = accountRouter;
