import { Client, SlashCommandBuilder, GatewayIntentBits, Routes, REST } from 'discord.js';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userSchema from './schema.js'

dotenv.config()

const commands = [
  new SlashCommandBuilder().setName('checkinactive').setDescription('checks who is inactive and gives them an inactive role').addRoleOption(option => option.setName('role').setDescription('role to give inactive users').setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  } catch (error) {
    console.error(error)
  }
})();

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
  ]
});

client.once('ready', async c => {
  await mongoose.connect(process.env.MONGO_URI, {
    keepAlive: true,
  })
  console.log(`Bot logged in as ${c.user.tag}`)
})

client.on("messageCreate", async (interaction) => {
  const id = interaction.author.id
  console.log(id)
  const timestamp = interaction.createdTimestamp
  const userExists = await userSchema.findOne({ "userid": id })
  if (userExists) {
    // update
    await userSchema.findOneAndUpdate({ "userid": id }, { $set: { "lastMessageDate": timestamp } })
  } else {
    // create new
    await new userSchema({
      lastMessageDate: timestamp,
      userid: id,
    }).save()
  }
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'checkinactive') {
    const list = await interaction.guild.members.fetch()
    const roleId = await interaction.options.getRole('role').id
    list.each(async (member) => {
      const id = member.id
      const userExists = await userSchema.findOne({ "userid": id })

      // user has 0 messages since bot has joined/ was online
      if (!userExists) {
        member.roles.add(roleId)
        return
      }

      // hours * minutes * seconds * milliseconds
      const month = (24 * 60 * 60 * 1000) * 30 // 30 days;

      // user has not posted in 30 days
      if (userExists.lastMessageDate <= Date.now() - month) {
        member.roles.add(roleId)
        return
      }

    })
    await interaction.reply('Pong');
  }
})

client.login(process.env.DISCORD_TOKEN);