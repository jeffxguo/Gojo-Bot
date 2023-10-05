const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption(option => option.setName('target').setDescription('The user\'s info to show.')),
	async execute(interaction) {
		const user = interaction.options.getUser('target');
		if (user) return interaction.reply(`${user.username} was created on ${user.createdAt}`);
		return interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt} and was created on ${interaction.user.createdAt}.`);
	},
};