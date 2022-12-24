const express = require("express");
const postRouter = express.Router();

const postsController = require("../controllers/post.controller");
const auth = require("../middlewares/auth.middleware");

postRouter.get('/get_post/:id', auth, postsController.get_post);
postRouter.get('/get_list_posts', auth, postsController.get_list_posts);
module.exports = postRouter;