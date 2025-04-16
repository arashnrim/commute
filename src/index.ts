import dotenv from "dotenv";
import { Bot } from "grammy";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN is not defined as an environment variable."
  );
}

const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.on("message", (ctx) => {
  ctx.reply("Hello, world!");
});

bot.start();
console.log("Bot started! Now actively listening for new messages.");
