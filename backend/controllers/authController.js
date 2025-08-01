import express from "express";
import passport from "passport";
import { SignJWT } from "jose";
import { insertLoginHistory } from "../models/user/userModel.js";

/**
 * @openapi
 * /auth/google:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Start Google OAuth login
 *     description: |
 *       **Note:** This endpoint starts the Google OAuth login flow and is intended to be accessed via a web browser. It will redirect you to Google for authentication. You cannot fully test this endpoint using Swagger UI; instead, copy the Request URL and open it in your browser to begin the login process.
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth login page.
 */
/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Google OAuth callback
 *     description: |
 *       **Note:** This endpoint handles the callback from Google after authentication. It is not meant to be called directly. On success, it redirects to the frontend with a JWT token. To test the full flow, start with `/auth/google` in your browser.
 *     responses:
 *       302:
 *         description: Redirects to frontend with JWT token.
 *       401:
 *         description: Authentication failed.
 */
export const AuthController = () => {
  const router = express.Router();

  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account", session: false }));

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/google/failure", session: false }),
    async (req, res) => {
      const user = req.user;
      await insertLoginHistory(user.id);
      const secret = new TextEncoder().encode(process.env.SECRET || "");
      const token = await new SignJWT({
        sub: user.id,
        role: user.role
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(secret);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/?token=${token}`);
    }
  );

  router.get("/google/failure", (req, res) => {
    res.status(401).send("Google authentication failed");
  });

  return router;
}; 