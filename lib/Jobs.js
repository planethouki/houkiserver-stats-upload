const async = require('async');
const initSqlJs = require('sql.js')

module.exports = class Jobs {
    constructor(dbData) {
        this.dbData = dbData;
    }

    init() {
        return initSqlJs()
            .then((sql) => {
                this.db = new sql.Database(this.dbData)
            });
    }

    dbPoints(callback) {
        const result = []
        try {
            const stmt = this.db.prepare(
                "select username, max(totalpoints) as totalpoints from points"
                + " join users on points.userid = users.id"
                + " where totalpoints > 0"
                + " group by userid"
                + " order by totalpoints desc;"
            );
            while (stmt.step()) {
                result.push(stmt.getAsObject())
            }
            callback(null, result)
        } catch (e) {
            callback(e)
        }
    }

    dbRank(callback) {
        async.waterfall([
            (callback_jobNames) => {
                const result = []
                try {
                    const stmt = this.db.prepare('select * from jobNames')
                    while (stmt.step()) {
                        result.push(stmt.getAsObject())
                    }
                    callback_jobNames(null, result)
                } catch (e) {
                    callback_jobNames(e)
                }
            },
            (jobs, callback_jobs) => {
                async.map(jobs, (job, callback_job) => {
                    const result = []
                    try {
                        const stmt = this.db.prepare(
                            "select username, name, level from jobs" +
                            "    join users on jobs.userid = users.id" +
                            "    join jobNames on jobs.jobid = jobNames.id" +
                            "    where jobs.jobid = " + job.id +
                            "    order by level desc;")
                        while (stmt.step()) {
                            result.push(stmt.getAsObject())
                        }
                        callback_job(null, result)
                    } catch (e) {
                        callback_job(e)
                    }
                }, (err, results) => {
                    const ret = {}
                    for (let item of results) {
                        if (item.length === 0) {
                            continue;
                        }
                        ret[item[0].name] = item
                    }
                    callback_jobs(err, ret)
                })
            },
        ], callback)
    }

    do(done) {
        async.series({
            points: (callback) => {
                this.dbPoints(callback);
            },
            ranks: (callback) => {
                this.dbRank(callback);
            }
        }, (err, {points, ranks}) => {
            done(err, {points, ranks});
        })
    }

};


