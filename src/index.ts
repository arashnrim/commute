import { Telegraf } from "telegraf";
import "dotenv/config";

if (!process.env.BOT_TOKEN) {
  throw "Bot token not found. Please enter it as an environment variable!";
}
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((context) => {
  context.replyWithMarkdown(`
*Hello there! Thanks for using me, Commute!*

Use me to find out arrival timings and other useful information. Instead of having to frequently check a navigation app, all you need to do is to send me an identifier (like a bus stop code) and your bus in question. I'll come back with approximate arrival times, given by the LTA!

For example, if you're at a bus stop with code \`x\` and want to know the arrival time of bus \`y\`, you can send me \`/arrival x y\`. I'll try to respond as soon as I can!

⚠️ *Early access warning*
I'm still in the alpha stage of things, and I'm currently still in development. If you'd like, check out my source code on [GitHub](https://github.com/arashnrim/commute); if you're an avid developer, feel free to fork and contribute!
`);
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
