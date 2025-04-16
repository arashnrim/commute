import dotenv from "dotenv";
import { Bot } from "grammy";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined as an environment variable.");
}

const bot = new Bot(BOT_TOKEN);

bot.on("message", (ctx) => {
  ctx.reply("Hello, world!");
});

bot.start();
console.log("Bot started! Now actively listening for new messages.");
