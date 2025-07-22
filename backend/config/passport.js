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
      const email = profile.emails[0].value;
      let user = await getUserByEmail(email);
      if (!user) {
        user = await createOAuthUser({
          name: profile.displayName,
          email: email,
          profile_picture_url: profile.photos[0]?.value,
          date_of_birth: null,
          gender: null
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));
