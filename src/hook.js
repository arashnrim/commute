import express from "express";
import bot from "./index.js";

const app = express();

// Configures the bot's webhook as a middleware
app.use(
  await bot.createWebhook({
    domain: process.env.HOSTING_DOMAIN,
  })
);

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server listening on port ${process.env.PORT || 3000}!`)
);
