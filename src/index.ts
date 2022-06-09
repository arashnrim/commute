import { Telegraf } from "telegraf";
import "dotenv/config";
import { fetchArrival, parseInput, RejectionReason } from "./utils/arrival";

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

I might prompt you for more information if I need it. Otherwise, I'll give you the arrival timings!
      `);
    return;
  }

  parseInput(args).then((result) => {
    switch (result) {
      case RejectionReason.Service:
        context.replyWithMarkdown(`
*Whoops, that doesn't look right!*

I don't think you've entered a valid bus service at the end of the command. Please try again.
        `);
        return;
      case RejectionReason.Stop:
        context.replyWithMarkdown(`
*Whoops, that doesn't look right!*

I don't think you've entered a valid bus stop in the command. Please try again.
        `);
        return;
    }

    // Fetches data from DataMall
    fetchArrival(args[1], args[args.length - 1].toUpperCase()).then(
      (arrivals) => {
        var estimates: string[] = [];
        const currentTime = new Date();

        for (const arrival of arrivals) {
          const difference =
            new Date(arrival.EstimatedArrival).valueOf() -
            currentTime.valueOf();
          const estimate = Math.floor(difference / 1000 / 60);
          if (estimate >= 0) {
            estimates.push(`Estimated arrival: *${estimate} min*`);
          }
        }

        context.replyWithMarkdown(`
*${args[args.length - 1].toUpperCase()} at bus stop ${args[1]}*

${estimates.join("\n")}
        `);
      }
    );
  });
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
