// import express from "express";
// import fetch from "node-fetch";

// const router = express.Router();

// router.get("/uploads/:filename", async (req, res) => {
//   const filename = req.params.filename;
//   const url = `http://localhost:9000/my-bucket/profile-pictures/${filename}`;

//   try {
//     const response = await fetch(url);
//     if (!response.ok) return res.status(response.status).send("Error fetching image");

//     const contentType = response.headers.get("content-type");
//     res.set("Content-Type", contentType);
//     response.body.pipe(res);
//   } catch (err) {
//     console.error("Image proxy error:", err);
//     res.status(500).send("Failed to load image");
//   }
// });

// export default router;

import express from "express";
import { getMinioImage } from "../controllers/imageController.js";

const router = express.Router();

router.get("/uploads/:filename", getMinioImage);

export default router;
