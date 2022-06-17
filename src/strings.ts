import dedent from "dedent";

export const strings = {
  start: dedent`
  *Hello there! Thanks for using me, Commute!*

  Use me to find out arrival timings and other useful information. Instead of having to frequently check a navigation app, all you need to do is to send me an identifier (like a bus stop code) and your bus in question. I'll come back with approximate arrival times, given by the LTA!

  To use me, send me the identifier and bus service. If you aren't sure on what to give, just use the /help and I'll give some help. I'll try to get back to you as soon as possible!

  ⚠️ *Early access warning*
  I'm still in the alpha stage of things, and I'm currently still in development. If you'd like, check out my source code on [GitHub](https://github.com/arashnrim/commute); if you're an avid developer, feel free to fork and contribute!
  `,

  help: dedent`
  *Getting arrival timings*

  To get arrival timings, send me a bus stop code and the service. Below is an example.

  <bus stop code> <bus number>

  For example, send me *43009 61* if you'd like to find out the arrival timings for bus service 61 at bus stop 43009 (or the Bukit Batok Bus Interchange!).

  I might prompt you for more information if I need it. Otherwise, I'll give you the arrival timings!
  `,

  invalidService: dedent`
  *Whoops, that doesn't look right!*

  I don't think you've entered a valid bus service at the end of the command. Please try again.
  `,

  invalidStop: dedent`
  *Whoops, that doesn't look right!*

  I don't think you've entered a valid bus stop in the command. Please try again.
  `,

  invalidRoad: dedent`
  *Whoops, that doesn't look right!*

  I don't think you've entered a valid road that a bus service visits. Please try again.
  `,

  invalidArrival: dedent`
  *Whoops, that doesn't look right!*

  It seems like the bus service you've entered doesn't serve the provided bus stop or road. Please try again.
  `,
};

export const devStrings = {
  noTelegramKey:
    "Telegram bot key not found. Please enter it as an environment variable!",
  noDataMallKey:
    "DataMall account key not found. Please enter it as an environment variable!",
  noMongoURI:
    "MongoDB URI not found. Please enter it as an environment variable!",
};
