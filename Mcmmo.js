const axios = require('axios');
const async = require('async');
const fs = require('fs');


module.exports = class Mcmmo {
    constructor(uploadApiUrl) {
        this.uploadApiUrl = uploadApiUrl;
    }

    do() {
        async.waterfall([
            (callback) => {
                fs.readFile('../plugins/mcMMO/flatfile/mcmmo.users', 'utf8', callback);
            },
            (file, callback) => {
                const lines = file.trim().replace(/\r?\n/g, '\n').split('\n');
                callback(null, lines);
            },
            (lines, callback) => {
                const players = lines.map((line) => {
                    const item = line.split(':');
                    return {
                        playerName: item[0],
                        skillLevel_MINING: item[1],
                        void2: item[2],
                        void3: item[3],
                        skillXpLevel_MINING: item[4],
                        skillLevel_WOODCUTTING: item[5],
                        skillXpLevel_WOODCUTTING: item[6],
                        skillLevel_REPAIR: item[7],
                        skillLevel_UNARMED: item[8],
                        skillLevel_HERBALISM: item[9],
                        skillLevel_EXCAVATION: item[10],
                        skillLevel_ARCHERY: item[11],
                        skillLevel_SWORDS: item[12],
                        skillLevel_AXES: item[13],
                        skillLevel_ACROBATICS: item[14],
                        skillXpLevel_REPAIR: item[15],
                        skillXpLevel_UNARMED: item[16],
                        skillXpLevel_HERBALISM: item[17],
                        skillXpLevel_EXCAVATION: item[18],
                        skillXpLevel_ARCHERY: item[19],
                        skillXpLevel_SWORDS: item[20],
                        skillXpLevel_AXES: item[21],
                        skillXpLevel_ACROBATICS: item[22],
                        void23: item[23],
                        skillLevel_TAMING: item[24],
                        skillXpLevel_TAMING: item[25],
                        abilityDATS_BERSERK: item[26],
                        abilityDATS_GIGA_DRILL_BREAKER: item[27],
                        abilityDATS_TREE_FELLER: item[28],
                        abilityDATS_GREEN_TERRA: item[29],
                        abilityDATS_SERRATED_STRIKES: item[30],
                        abilityDATS_SKULL_SPLITTER: item[31],
                        abilityDATS_SUPER_BREAKER: item[32],
                        void33: item[33],
                        skillLevel_FISHING: item[34],
                        skillXpLevel_FISHING: item[35],
                        abilityDATS_BLAST_MINING: item[36],
                        currentTimeMillis: item[37],
                        mobHealthbarType: item[38],
                        skillLevel_ALCHEMY: item[39],
                        skillXpLevel_ALCHEMY: item[40],
                        uuid: item[41],
                        scoreboardTipsShown: item[42],
                        uniqueData_CHIMAERA_WING_DATS: item[43]
                    }
                });
                callback(null, players)
            },
            (players, callback) => {
                if (players.length === 0) callback('no data');
                const skillLevelKeys = Object.keys(players[0]).filter((key) => {
                    return key.startsWith('skillLevel')
                });
                const playersLevel = players.map((player) => {
                    const ret = {};
                    let totalLevel = 0;
                    ret['playerName'] = player.playerName;
                    skillLevelKeys.forEach((key) => {
                        ret[key.replace('skillLevel_', '')] = Number(player[key]);
                        totalLevel += Number(player[key])
                    });
                    ret['totalLevel'] = totalLevel;
                    return ret
                });
                callback(null, playersLevel)
            },
            (playersLevel, callback) => {
                if (playersLevel.length === 0) callback('no data');
                const skillLevelRanks = {};
                Object.keys(playersLevel[0]).filter((key) => {
                    return key !== 'playerName'
                }).forEach((skill) => {
                    skillLevelRanks[skill] = []
                });
                playersLevel.forEach((playerLevel) => {
                    Object.keys(skillLevelRanks).forEach((skill) => {
                        if (playerLevel[skill] === 0) {
                            return
                        }
                        skillLevelRanks[skill].push({
                            playerName: playerLevel.playerName,
                            level: playerLevel[skill]
                        })
                    })
                });
                callback(null, skillLevelRanks)
            },
            (skillLevelRanks, callback) => {
                Object.keys(skillLevelRanks).forEach((key) => {
                    skillLevelRanks[key].sort((a, b) => {
                        const x = a.level, y = b.level;
                        return y - x
                    })
                });
                callback(null, skillLevelRanks)
            }
        ], (err, result) => {
            if (err) console.log(err);
            // console.log(result)
            axios.post(this.uploadApiUrl, {name: 'mcmmo.json', data: result}).catch(console.error)
        })
    }
}