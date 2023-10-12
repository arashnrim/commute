![](banner.svg)

# commute

Welcome to the repository for Commute! Commute is a simple Telegram bot that I wrote with the intention to aid me with public transportation in Singapore. It's mostly meant for personal use, but feel free to check it out anyway and tweak it for your use!

## Motivations

I've been wanting to start a project that uses data from [the Land Transport Authority's DataMall](https://datamall.lta.gov.sg), and what better way than to create a Telegram bot for it? I use Telegram almost daily mainly for school, and it would be nice to have quick information about transport when I need it instead of having to open up a navigation app. My current choice for public transport is [Citymapper](https://citymapper.com), and although it works great, I'd love to have an even faster option!

## Getting Started

This brief explainer assumes that you have a version of Node and a Node package manager (e.g., npm, Yarn, or pnpm) installed.

1. To get started with the repository, first clone the repository and change your working directory:

   ```
   git clone https://github.com/arashnrim/commute && cd commute
   ```

2. If you aren't a pnpm user, remove the `pnpm-lock.yaml` file.

   ```
   rm pnpm-lock.yaml
   ```

3. Install the required dependencies.

   ```
   npm i # or
   yarn # or
   pnpm i
   ```

4. Contact [BotFather](http://t.me/BotFather) to create a bot and keep note of the key. Do not share this key with anyone else!

5. Create a MongoDB database and keep note of its address. Do not share this with anyone else!

   > ~~I used [Railway](https://railway.app) to host my bot and set up a MongoDB database. You can choose where to host and run your bot and database, but just a little good-to-know especially if you aren't sure how to create a database!~~
   >
   > I now use [MongoDB Atlas](https://www.mongodb.com/atlas/database) to host a MongoDB server and run the bot locally using an always-on\* Raspberry Pi via the compiled Docker package.
   >
   > \*_I'm learning more about self-hosting with the Raspberry Pi, so this is a little experimental project too to see if this works!_

6. Sign up for an account key at the [LTA's DataMall](https://datamall.lta.gov.sg). Do not share this key with anyone else!

7. Create an environment variable file (`.env`) and add your secrets inside; remember to replace the placeholders (in `<` and `>` with your own values!):

   ```
   BOT_TOKEN=<token>
   MONGO_URI=<uri>
   ACCOUNT_KEY=<key>
   ```

   You may use the `.env.example` file as an example.

8. Run the `dev` script to run the bot.

   ```
   npm dev # or
   yarn dev # or
   pnpm dev
   ```

9. To deploy the bot, configure your deployment service to run the `start` command.

That's all! Your bot should be ready to interact with on Telegram.

## Contributing

This project is **accepting contributions**. If you'd like to have a go at the source code and contribute — be it fixing bugs or even contributing new features —, by all means! I welcome your involvement.

If there is an issue — like a spelling or grammatical error, a visual bug, or other kinds of weird things happening — please feel free to [create an issue](https://github.com/arashnrim/commute/issues/new). If you would like to leave comments about the source code — like possible design and code improvements, or other kinds of feedback — please feel free to [create an issue](https://github.com/arashnrim/website/issues/new) too if you wish!

## Licence

This repository is made open-source with the [MIT License](https://github.com/arashnrim/commute/blob/main/LICENSE.md), meaning that you are allowed to modify and distribute the source code as well as use it for private and commercial use provided that the licence and copyright notices are retained. For more information, visit the link above to learn what is permitted by the licence.
