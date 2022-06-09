import { Telegraf } from "telegraf";
import "dotenv/config";
import { fetchArrival, parseInput, RejectionReason } from "./utils/arrival";
import { strings } from "./strings";

if (!process.env.BOT_TOKEN) {
  throw "Bot token not found. Please enter it as an environment variable!";
}
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((context) => {
  context.replyWithMarkdown(strings.start);
});

bot.command("arrival", (context) => {
  const args = context.message.text.split(" ");

  if (args.length === 1 && args[0] === "/arrival") {
    // Displays help message
    context.replyWithMarkdown(strings.arrivalHelp);
    return;
  }

  parseInput(args).then((result) => {
    switch (result) {
      case RejectionReason.Service:
        context.replyWithMarkdown(strings.invalidService);
        return;
      case RejectionReason.Stop:
        context.replyWithMarkdown(strings.invalidStop);
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
