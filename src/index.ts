import { Telegraf } from "telegraf";
import "dotenv/config";
import {
  displayArrivalTimings,
  fetchArrivalTimings,
  parseInput,
  RejectionReason,
} from "./utils/arrival";
import { strings } from "./strings";
import dedent from "dedent";

if (!process.env.BOT_TOKEN) {
  throw "Bot token not found. Please enter it as an environment variable!";
}
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((context) => {
  context.replyWithMarkdown(strings.start);
});

bot.command("help", (context) => {
  // Displays help message
  context.replyWithMarkdown(strings.help);
  return;
});

bot.on("text", (context) => {
  const args = context.message.text.split(" ");

  parseInput(args).then((result) => {
    switch (result) {
      case RejectionReason.ServiceNotFound:
        context.replyWithMarkdown(strings.invalidService);
        return;
      case RejectionReason.StopNotFound:
        context.replyWithMarkdown(strings.invalidStop);
        return;
    }

    // Fetches data from DataMall
    fetchArrivalTimings(args[0], args[args.length - 1].toUpperCase()).then(
      (arrivals) => {
        const estimates = displayArrivalTimings(arrivals);
        if (estimates.length === 0) {
          context.replyWithMarkdown(strings.invalidArrival);
        } else {
          context.replyWithMarkdown(dedent`
          *${args[args.length - 1].toUpperCase()} at bus stop ${args[1]}*

          ${estimates.join("\n")}
          `);
        }
      }
    );
  });
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
