const { AttachmentBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const API_KEY = process.env.RIOT_API_KEY;
// TODO: Add avatar icon
// TODO: Best recent match (maybe)
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

        // Fetch summoner info
        const summonerInfo = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}?api_key=${API_KEY}`).then(
            (response) => {
                if (response.ok) return response.json();
                throw response.json();
            },
        ).catch(error => {
            interaction.editReply({ content: `Summoner ${summoner} not found!` });
            return error;
        });
        console.log(JSON.stringify(summonerInfo));
        if (summonerInfo.status) {
            return;
        }

        const encryptedId = summonerInfo.id;
        const name = summonerInfo.name.replace(/ /g, '+');
        const puuid = summonerInfo.puuid;
        const iconId = summonerInfo.profileIconId;

        // Fetch game version
        const gameVersions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(
            (response) => {
                if (response.ok) return response.json();
                throw response.json();
            },
        ).catch(error => {
            interaction.editReply({ content: 'Game versions not found!' });
            return error;
        });
        if (gameVersions.status) {
            console.log(JSON.stringify(gameVersions));
            return;
        }

        const version = gameVersions[0];

        // Fetches match ids for past count ranked games, queue=420 for ranked games
        const count = 20;
        const matchList = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${count}&api_key=${API_KEY}`).then(
            (response) => response.json(),
        );

        // Iterate over every match
        let matchCount = 0;
        let wins = 0;
        let kills = 0;
        let deaths = 0;
        let assists = 0;
        // eslint-disable-next-line prefer-const
        let posMap = {};
        let maxPos = 'N/A';
        let maxCount = 0;
        for (let i = 0; i < Math.min(count, Object.keys(matchList).length); i++) {
            const matchId = matchList[i];
            const matchDetails = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`).then(
                (response) => {
                    if (response.ok) return response.json();
                    throw response.json();
                },
            ).catch(error => {
                interaction.editReply({ content: 'Too many requests! Please wait and try again.' });
                return error;
            });
            if (matchDetails.status) {
                console.log(JSON.stringify(matchDetails));
                return;
            }

            matchCount++;
            for (let x = 0; x < 10; x++) {
                if (matchDetails.metadata.participants[x] == puuid) {
                    if (matchDetails.info.participants[x].win == true) {
                        wins++;
                    }
                    kills += matchDetails.info.participants[x].kills;
                    deaths += matchDetails.info.participants[x].deaths;
                    assists += matchDetails.info.participants[x].assists;
                    // Count lanes
                    const pos = matchDetails.info.participants[x].teamPosition;
                    if (posMap[pos] == null) {
                        posMap[pos] = 1;
                    } else {
                        posMap[pos]++;
                    }
                    if (posMap[pos] > maxCount) {
                        maxPos = pos;
                        maxCount = posMap[pos];
                    }
                    break;
                }
            }
        }
        const winrate = ((wins / matchCount) * 100).toFixed(2);
        const kda = ((kills + deaths) / assists).toFixed(2);

        if (maxPos == 'UTILITY') {
            maxPos = 'SUPPORT';
        }

        // Fetches rank
        const ranks = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedId}?api_key=${API_KEY}`).then(
            (response) => response.json(),
        );
        console.log(JSON.stringify(ranks));
        let soloRank = 'UNRANKED';
        if (ranks.length == 1) {
            soloRank = `${ranks[0].tier} ${ranks[0].rank}`;
        } else if (ranks.length > 1) {
            soloRank = `${ranks[1].tier} ${ranks[1].rank}`;
        }
        // const img = new AttachmentBuilder(`./images/ranked-emblem/emblem-${soloRank.toLowerCase()}.png`);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(summonerInfo.name)
            .setURL(`https://www.op.gg/summoners/na/${name}`)
            .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`)
            .addFields(
                { name: 'Level', value: `${summonerInfo.summonerLevel}` },
                { name: `Solo/Duo Winrate (Past ${matchCount} games)`, value: `${winrate}%`, inline: true },
                { name: 'Average KDA', value: kda, inline: true },
                { name: ' ', value: ' ' },
            )
            .addFields(
                { name: 'Solo/Duo Rank', value: soloRank, inline: true },
                { name: 'Most played role', value: maxPos, inline: true },
            )
            .setFooter({ text: `Data is from past ${matchCount} games.` });
            // .setImage(`attachment://emblem-${soloRank.toLowerCase()}.png`)

        await interaction.editReply({ embeds: [embed]/* , files: [img]*/ });
    },
};