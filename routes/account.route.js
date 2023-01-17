const express = require("express");
const accountRouter = express.Router();

const accountsController = require("../controllers/account.controller");
const auth = require("../middlewares/auth.middleware");
const uploadAvatarOrCoverImageMiddleware = require("../middlewares/uploadAvatarOrCoverImage.middleware");

accountRouter.post('/login', accountsController.login);
accountRouter.post('/signup', accountsController.signup);
accountRouter.get('/get_user_info', auth, accountsController.get_user_info);
accountRouter.post('/set_user_info',uploadAvatarOrCoverImageMiddleware, auth, accountsController.set_user_info);

module.exports = accountRouter;