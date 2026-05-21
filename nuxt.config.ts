export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    jwtSecret: process.env.JWT_SECRET,
    
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

 

    docusignBasePath: process.env.DOCUSIGN_BASE_PATH,
    docusignAccountId: process.env.DOCUSIGN_ACCOUNT_ID,
    docusignClientId: process.env.DOCUSIGN_CLIENT_ID,
    docusignUserId: process.env.DOCUSIGN_USER_ID,
    docusignPrivateKey: process.env.DOCUSIGN_PRIVATE_KEY,
    docusignAuthServer: process.env.DOCUSIGN_AUTH_SERVER,

    public: {
      appUrl: process.env.APP_URL || "http://localhost:3000",
    },
  },
});
