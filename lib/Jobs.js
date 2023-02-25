const sqlite3 = require('sqlite3').verbose();
const async = require('async');
const path = require('path');

module.exports = class Jobs {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }

    dbPoints(db, callback) {
        db.all(
            "select username, player_uuid as uuid, max(totalpoints) as totalpoints from points"
            + " join users on points.userid = users.id"
            + " where totalpoints > 0"
            + " group by userid"
            + " order by totalpoints desc;",
            callback
        );
    }

    dbRank(db, callback) {
        async.waterfall([
            (callback_jobNames) => {
                db.all(
                    'select * from jobNames',
                    callback_jobNames
                )
            },
            (jobs, callback_jobs) => {
                async.map(jobs, (job, callback_job) => {
                    db.all(
                        "select username, player_uuid as uuid, name, level from jobs" +
                        "    join users on jobs.userid = users.id" +
                        "    join jobNames on jobs.jobid = jobNames.id" +
                        "    where jobs.jobid = " + job.id +
                        "    order by level desc;",
                        callback_job
                    );
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

    getDb() {
        return new sqlite3.Database(this.dbPath);
    }

    do(done) {
        const db = this.getDb();
        db.serialize(() => {
            async.series({
                points: (callback) => {
                    this.dbPoints(db, callback);
                },
                ranks: (callback) => {
                    this.dbRank(db, callback);
                }
            }, (err, {points, ranks}) => {
                db.close();
                done(err, {points, ranks});
            })
        });
    }

};


