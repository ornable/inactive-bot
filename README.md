# inactive-bot
Proof of concept inactivity bot. Will save the time of a user's latest message. When the command /checkinactive is used, the bot will check all members of a guild(server) and see if their last message day is longer than 30 days. If it is, then they are given the specified role.

# How to use
- Set up your bot
- Create `.env` file and add `DISCORD_TOKEN`, `MONGO_URI`, and `CLIENT_ID`
- `npm i` to install npm packages
- `npm run dev` to test the bot with nodemon
- use the `/checkinactive` command in discord
