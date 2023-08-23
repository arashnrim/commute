import { Telegraf } from "telegraf";
import "dotenv/config";
import {
  displayArrivalTimings,
  getArrivalTimings,
  parseInput,
} from "./utils/arrival.js";
import { devStrings, strings } from "./strings.js";
import dedent from "dedent";
import { callbackQuery, message } from "telegraf/filters";

if (!process.env.BOT_TOKEN) {
  throw devStrings.noTelegramKey;
}
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((context) => {
  context.replyWithMarkdownV2(strings.start);
  console.log(`New session started with user ${context.from.id}`);
});

bot.help((context) => {
  // Displays help message
  context.replyWithMarkdownV2(strings.help);
  return;
});

bot.on(message("text"), (context) => {
  const args = context.message.text.split(" ");

  parseInput(args).then((result) => {
    switch (result) {
      case "SERVICE_NOT_FOUND":
        context.replyWithMarkdownV2(strings.invalidService);
        return;
      case "STOP_NOT_FOUND":
        context.replyWithMarkdownV2(strings.invalidStop);
        return;
      case "ROAD_NOT_FOUND":
        context.replyWithMarkdownV2(strings.invalidRoad);
        return;
    }

    if (Array.isArray(result)) {
      const options = [[]];
      for (const stop of result) {
        if (options[options.length - 1].length === 2) {
          options.push([
            {
              text: stop.Description,
              callback_data: `${stop.BusStopCode} ${args[args.length - 1]} ${
                stop.Description
              }`,
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
      getArrivalTimings(args[0], args[args.length - 1].toUpperCase()).then(
        (arrivals) => {
          const estimates = displayArrivalTimings(arrivals);
          if (estimates.length === 0) {
            context.replyWithMarkdownV2(strings.invalidArrival);
          } else {
            context.replyWithMarkdownV2(dedent`
          *${args[args.length - 1].toUpperCase()} at bus stop ${args[0]}*

          ${estimates.join("\n")}
          `);
          }
        }
      );
    }
  });
});

bot.on(callbackQuery("data"), async (context) => {
  if (!context.callbackQuery.data) {
    context.replyWithMarkdownV2("Sorry, something went wrong.");
    return;
  }
  const data = context.callbackQuery.data?.split(" ");
  // Fetches data from DataMall
  getArrivalTimings(data[0], data[1].toUpperCase()).then((arrivals) => {
    const estimates = displayArrivalTimings(arrivals);
    if (estimates.length === 0) {
      if (
        arrivals[0].EstimatedArrival === "" &&
        arrivals[1].EstimatedArrival === "" &&
        arrivals[2].EstimatedArrival === ""
      ) {
        context.replyWithMarkdownV2(strings.noMoreServiceToday);
      } else if (
        arrivals[1].EstimatedArrival === "" ||
        arrivals[2].EstimatedArrival === ""
      ) {
        context.replyWithMarkdownV2(strings.serviceEndingWarning);
      } else {
        context.replyWithMarkdownV2(strings.unavailableArrival);
      }

      context.answerCbQuery();
    } else {
      context.replyWithMarkdownV2(dedent`
          *${data[1].toUpperCase()} at bus stop ${data[0]}* \(${data
        .slice(2)
        .join(" ")}\)

          ${estimates.join("\n")}
          `);
      context.answerCbQuery();
    }
  });
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export { bot };
