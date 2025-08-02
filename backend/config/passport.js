import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getUserByEmail, createOAuthUser, getUser } from "../models/user/userModel.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Validate profile data
      if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
        console.error("Google OAuth: No email found in profile", profile);
        return done(new Error("No email found in Google profile"), null);
      }

      const email = profile.emails[0].value;
      let user = await getUserByEmail(email);
      
      if (!user) {
        user = await createOAuthUser({
          name: profile.displayName || "Google User",
          email: email,
          profile_picture_url: profile.photos?.[0]?.value || null,
          date_of_birth: null,
          gender: null
        });
        
        console.log(`Created new OAuth user: ${email} with ID: ${user.id}`);
      } else {
        console.log(`Existing user logged in via OAuth: ${email} with ID: ${user.id}`);
      }
      
      return done(null, user);
    } catch (err) {
      console.error("Google OAuth strategy error:", err);
      return done(err, null);
    }
  }
));
