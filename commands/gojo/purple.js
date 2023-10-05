const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hollow-purple')
        .setDescription('Hollow Purple.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to be targetted by Hollow Purple')
                .setRequired(true)),
    async execute(interaction) {
		const target = interaction.options.getUser('target');

        await interaction.reply(`Gojo Satoru used Hollow Purple on <@${target.id}>!`);
        await interaction.followUp('https://media.tenor.com/zDPGGtBO0nkAAAAC/gojou-gojo.gif');
    },
};