const { SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talk-to-gojo')
        .setDescription('Talk to the world\'s strongest jujutsu sorcerer')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('What you want to say to Gojo')
                .setRequired(true)),
    async execute(interaction) {
        return interaction.reply({ content: 'This command is incomplete!', ephemeral: true });
    },
};