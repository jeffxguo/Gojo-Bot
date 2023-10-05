const { SlashCommandBuilder } = require('discord.js');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with a Pong!'),
    async execute(interaction) {
        await interaction.reply({ content: 'Pong!' });
        await wait(2000);
        await interaction.editReply('Pong again!');
        await wait(2000);
        await interaction.followUp({ content: 'Secret Pong!', ephemeral: true });
    },
};