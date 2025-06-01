import express from "express"

const app = express();

app.use(express.static("dist"))


app.listen(3001, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server started on port 3001");
})