import express from "express"
import {Controller} from "./controllers/controller.js";

const app = express();

app.use(express.json())
app.use(express.static("dist"))

Controller(app)

app.listen(3001, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server started on port 3001");
})