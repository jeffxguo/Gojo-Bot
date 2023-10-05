const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');

const API_KEY = process.env.RIOT_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summoner')
        .setDescription('Fetches data for specified summoner')
        .addStringOption(option =>
            option.setName('summoner')
                .setDescription('IGN of summoner')
                .setRequired(true)),
    async execute(interaction) {
        const summoner = interaction.options.getString('summoner');
        await interaction.deferReply();

        const summonerInfo = await request(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}?api_key=${API_KEY}`);
        console.log('Request made successfully!');
        const response = await summonerInfo.body.json();
        console.log(JSON.stringify(response));
        await interaction.editReply({ content: `Name: ${response.name}\n Level: ${response.summonerLevel}` });

        const name = response.name.replace(/ /g, '+');

        console.log(`https://www.op.gg/summoners/na/${name}`);
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(response.name)
            .setURL(`https://www.op.gg/summoners/na/${name}`)
            .addFields({ name: 'Level', value: `${response.summonerLevel}` });

        await interaction.editReply({ embeds: [embed] });
    },
};