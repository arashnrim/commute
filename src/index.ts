import { Telegraf } from "telegraf";
import "dotenv/config";
import {
  displayArrivalTimings,
  fetchArrivalTimings,
  RejectionReason,
  parseInput,
} from "./utils/arrival";
import { devStrings, strings } from "./strings";
import dedent from "dedent";
import type { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

if (!process.env.BOT_TOKEN) {
  throw devStrings.noTelegramKey;
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
      case RejectionReason.RoadNotFound:
        context.replyWithMarkdown(strings.invalidRoad);
        return;
    }

    if (Array.isArray(result)) {
      const options: InlineKeyboardButton[][] = [[]];
      for (const stop of result) {
        if (options[options.length - 1].length === 2) {
          options.push([
            {
              text: stop.Description,
              callback_data: `${stop.BusStopCode} ${args[args.length - 1]}`,
            },
          ]);
        } else {
          options[options.length - 1].push({
            text: stop.Description,
            callback_data: `${stop.BusStopCode} ${args[args.length - 1]}`,
          });
        }
      }

      context.reply(strings.multipleStops, {
        reply_markup: { inline_keyboard: options },
      });
    } else {
      // Fetches data from DataMall
      fetchArrivalTimings(args[0], args[args.length - 1].toUpperCase()).then(
        (arrivals) => {
          const estimates = displayArrivalTimings(arrivals);
          if (estimates.length === 0) {
            context.replyWithMarkdown(strings.invalidArrival);
          } else {
            context.replyWithMarkdown(dedent`
          *${args[args.length - 1].toUpperCase()} at bus stop ${args[0]}*

          ${estimates.join("\n")}
          `);
          }
        }
      );
    }
  });
});

bot.on("callback_query", async (context) => {
  if (!context.callbackQuery.data) {
    context.replyWithMarkdown("Sorry, something went wrong.");
    return;
  }
  const data = context.callbackQuery.data?.split(" ");
  // Fetches data from DataMall
  fetchArrivalTimings(data[0], data[data.length - 1].toUpperCase()).then(
    (arrivals) => {
      const estimates = displayArrivalTimings(arrivals);
      if (estimates.length === 0) {
        context.replyWithMarkdown(strings.unavailableArrival);
      } else {
        context.replyWithMarkdown(dedent`
          *${data[data.length - 1].toUpperCase()} at bus stop ${data[0]}*

          ${estimates.join("\n")}
          `);
      }
    }
  );
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export { bot };
