import express from "express"
import {Controller} from "./controllers/controller.js";
const adminController = require("./controllers/adminController.js");
const authorize =  require("./middlewares/authorize.js");

const app = express();
app.use(express.json())
app.use(express.static("dist"))

Controller(app)
app.use("/api/admin", authorize.adminAuthorizeMiddleware, adminController.adminRouter);


app.listen(3001, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server started on port 3001");
})