require("dotenv").config();

module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  server: {
    port: process.env.PORT || 2016,
  },
  session: {
    secret: process.env.SESSION_SECRET || "franchise-hub-v2-secret",
  },
};
