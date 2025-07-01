import express from "express"
import {Controller} from "./controllers/controller.js";

const app = express();

import cors from "cors";

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,               
}));


app.use(express.json())
app.use(express.static("dist"))

Controller(app)

app.listen(3001, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server started on port 3001");
})