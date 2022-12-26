const express = require("express");
const videoRouter = express.Router();

const videosController = require("../controllers/video.controller");
const auth = require("../middlewares/auth.middleware");

videoRouter.get('/get_video/:id', auth, videosController.get_video);
videoRouter.get('/get_list_videos', auth, videosController.get_list_videos);

module.exports = videoRouter;