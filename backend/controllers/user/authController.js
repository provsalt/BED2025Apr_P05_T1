import express from "express";
import passport from "passport";
import { AuthService } from "../../services/authService.js";
import { ErrorFactory } from "../../utils/AppError.js";

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
 * @param {Function} next - Express next middleware function
 */
const handleGoogleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw ErrorFactory.unauthorized("Authentication failed - no user data received from Google");
    }

    if (!user.id) {
      throw ErrorFactory.unauthorized("Authentication failed - invalid user data from Google");
    }
    // Handle authentication success through service layer
    const token = await AuthService.handleGoogleAuthSuccess(user);
    
    if (!token) {
      throw ErrorFactory.external("Token Service", "Failed to generate authentication token", "Unable to create session");
    }

    const redirectUrl = AuthService.getAuthRedirectUrl(token);
    res.redirect(redirectUrl);
    
  } catch (error) {
    // Log error for debugging but don't expose details to user
    console.error("Google OAuth callback error:", {
      message: error.message,
      stack: error.stack,
      user: req.user ? { id: req.user.id, email: req.user.email } : null
    });
    
    if (error.isOperational) {
      return next(error);
    }
    
    const authError = ErrorFactory.external("Authentication Service", "Google authentication failed", "Unable to complete sign-in process");
    next(authError);
  }
};

/**
 * Controller function to handle Google OAuth failure
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleGoogleFailure = (req, res, next) => {
  const error = ErrorFactory.unauthorized("Google authentication was cancelled or failed");
  next(error);
}; 