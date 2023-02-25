const axios = require('axios');
const async = require('async');
const fs = require('fs');
const yaml = require('yaml');

const filePath = '../plugins/ChestCommands/menu/default.yml';


module.exports = class ChestCommands {
    constructor(uploadApiUrl) {
        this.uploadApiUrl = uploadApiUrl;
    }

    do() {
        async.waterfall([
            (callback) => {
                fs.readFile(filePath, 'utf8', callback);
            },
            (file, callback) => {
                const s = file.trim().replace(/\r?\n/g, '\n');
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
            axios.post(this.uploadApiUrl, {name: 'menu.json', data: result}).catch(console.error)
        })
    }
}
