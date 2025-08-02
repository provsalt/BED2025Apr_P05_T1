import { SignJWT } from "jose";
import { insertLoginHistory } from "../models/user/userModel.js";

/**
 * Authentication Service
 * Handles business logic for authentication operations
 */
export class AuthService {
  /**
   * Generates a JWT token for a user
   * @param {Object} user - User object with id and role
   * @returns {Promise<string>} JWT token
   */
  static async generateJWTToken(user) {
    try {
      const secret = new TextEncoder().encode(process.env.SECRET || "");
      const token = await new SignJWT({
        sub: user.id,
        role: user.role
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(secret);
      
      return token;
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Handles successful Google OAuth authentication
   * @param {Object} user - Authenticated user object
   * @returns {Promise<string>} JWT token
   */
  static async handleGoogleAuthSuccess(user) {
    try {
      if (!user || !user.id) {
        throw new Error("Invalid user object - missing required fields");
      }

      try {
        await insertLoginHistory(user.id);
      } catch (historyError) {
        console.warn("Login history recording failed:", historyError.message);
      }
      
      const token = await this.generateJWTToken(user);
      
      if (!token) {
        throw new Error("Token generation returned empty result");
      }
      
      return token;
    } catch (error) {
      console.error("AuthService.handleGoogleAuthSuccess failed:", {
        message: error.message,
        userId: user?.id,
        userEmail: user?.email
      });
      
      throw new Error(`Authentication processing failed: ${error.message}`);
    }
  }

  /**
   * Gets the frontend URL for redirects
   * @returns {string} Frontend URL
   */
  static getFrontendUrl() {
    return process.env.FRONTEND_URL || "http://localhost:5173";
  }

  /**
   * Constructs the redirect URL with token
   * @param {string} token - JWT token
   * @returns {string} Complete redirect URL
   */
  static getAuthRedirectUrl(token) {
    const frontendUrl = this.getFrontendUrl();
    return `${frontendUrl}/?token=${token}`;
  }
}
