import fetch from "node-fetch";

/**
 * Streams an image from MinIO to the browser.
 */
export const getMinioImage = async (req, res) => {
  const filename = req.params.filename;
  const url = `http://localhost:9000/bed-sx-miniobucket/profile-pictures/${filename}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).send("Image fetch failed");

    res.set("Content-Type", response.headers.get("content-type"));
    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed");
  }
};
