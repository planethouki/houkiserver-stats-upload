const async = require('async');
const yaml = require('yaml');

module.exports = class JobsShop {
    constructor(rawData) {
        this.rawData = rawData
    }

    do(done) {
        async.waterfall([
            (callback) => {
                const s = this.rawData.trim().replace(/\r?\n/g, '\n');
                callback(null, yaml.parse(s));
            },
        ], (err, result) => {
            if (err) console.log(err);
            // console.log(result)
            done(err, result);
        })
    }
}
