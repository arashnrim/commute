import dedent from "dedent";

export const strings = {
  start: dedent`
  *Hello there! Thanks for using me, Commute!*

  Use me to find out arrival timings and other useful information. Instead of having to frequently check a navigation app, all you need to do is to send me an identifier (like a bus stop code) and your bus in question. I'll come back with approximate arrival times, given by the LTA!

  To use me, call the /arrival command. If you aren't sure on what to give, just use the command as it is and I'll give some help. I'll try to get back to you as soon as possible!

  ⚠️ *Early access warning*
  I'm still in the alpha stage of things, and I'm currently still in development. If you'd like, check out my source code on [GitHub](https://github.com/arashnrim/commute); if you're an avid developer, feel free to fork and contribute!
  `,

  arrivalHelp: dedent`
  */arrival — get arrival timings*

  Use this command to get arrival timings for a bus or train. Either one of the commands below will be valid.

  /arrival <bus stop code> <bus number>

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
};
