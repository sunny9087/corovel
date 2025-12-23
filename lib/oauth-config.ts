/**
 * Check if OAuth providers are configured
 */
import { env } from "./env";

export const oauthConfig = {
  google: {
    enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  },
  facebook: {
    enabled: !!(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET),
  },
  hasAnyProvider: () => {
    return (
      !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) ||
      !!(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)
    );
  },
};
