const express = require("express");
const commentRouter = express.Router();

const commentController = require("../controllers/comment.controller");
const auth = require("../middlewares/auth.middleware");

commentRouter.get('/getComment', auth, commentController.get_comment);
commentRouter.post('/setComment', auth, commentController.set_comment);

module.exports = commentRouter;