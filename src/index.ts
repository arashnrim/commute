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

To use me, call the /arrival command. If you aren't sure on what to give, just use the command as it is and I'll give some help. I'll try to get back to you as soon as possible!

⚠️ *Early access warning*
I'm still in the alpha stage of things, and I'm currently still in development. If you'd like, check out my source code on [GitHub](https://github.com/arashnrim/commute); if you're an avid developer, feel free to fork and contribute!
`);
});

bot.command("arrival", (context) => {
  const args = context.message.text.split(" ");

  if (args.length === 1 && args[0] === "/arrival") {
    // Displays help message
    context.replyWithMarkdown(`
*/arrival — get arrival timings*

Use this command to get arrival timings for a bus or train. Either one of the commands below will be valid.

/arrival <bus stop code> <bus number>
/arrival <street name> <bus number>
/arrival <train station code>

I might prompt you for more information if I need it. Otherwise, I'll give you the arrival timings!
      `);
    return;
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
