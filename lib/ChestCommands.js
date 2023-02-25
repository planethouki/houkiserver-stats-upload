const axios = require('axios');
const async = require('async');
const fs = require('fs');
const yaml = require('yaml');

module.exports = class ChestCommands {
    constructor(rawData) {
        this.rawData = rawData
    }

    do(done) {
        async.waterfall([
            (callback) => {
                const s = this.rawData.trim().replace(/\r?\n/g, '\n');
                callback(null, yaml.parse(s));
            },
            (data, callback) => {
                delete(data['menu-settings']);
                const d = Object.keys(data)
                    .filter(k => k !== 'menu-settings')
                    .filter(k => k !== 'menu-close-no-commands-no-lore')
                    .map(k => {
                        const raw = data[k]['LORE'];
                        const bodyText = Array.isArray(raw) ? raw.join('\n') : raw;
                        const body = bodyText.replace(/&./gm, '');
                        const title = data[k]['NAME'].replace(/&./gm, '');
                        return {
                            key: k,
                            title,
                            body
                        }
                    })
                callback(null, d);
            }
        ], (err, result) => {
            if (err) console.log(err);
            // console.log(result)
            done(err, result);
        })
    }
}
