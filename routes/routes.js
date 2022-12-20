const express = require("express");

const accountRouter = require("./account.route");
const {notFound, errorHandler} = require("../middlewares/error.middleware");
const mainRouter = express.Router();

mainRouter.use("/account", accountRouter);

// sử dụng middleware theo thứ tự từ trên xuống, nếu đảo 2 dòng dưới đây lên đầu thì app sẽ nhảy vào luôn và báo lỗi
mainRouter.use(notFound);  // a middleware function with no mount path. This code is executed for every request to the route
mainRouter.use(errorHandler);

module.exports = mainRouter;
