import express from "express";
import passport from "passport";
import { AuthService } from "../../services/authService.js";

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

  router.get("/google", initiateGoogleAuth);
  router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth/google/failure", session: false }), handleGoogleCallback);
  router.get("/google/failure", handleGoogleFailure);

  return router;
};

/**
 * Controller function to initiate Google OAuth authentication
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const initiateGoogleAuth = (req, res, next) => {
  passport.authenticate("google", { 
    scope: ["profile", "email"], 
    prompt: "select_account", 
    session: false 
  })(req, res, next);
};

/**
 * Controller function to handle Google OAuth callback
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const handleGoogleCallback = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).send("Authentication failed - no user data");
    }
    // Handle authentication success through service layer
    const token = await AuthService.handleGoogleAuthSuccess(user);
    
    const redirectUrl = AuthService.getAuthRedirectUrl(token);
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).send("Internal server error during authentication");
  }
};

/**
 * Controller function to handle Google OAuth failure
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const handleGoogleFailure = (req, res) => {
  res.status(401).send("Google authentication failed");
}; 