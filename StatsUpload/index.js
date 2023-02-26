// const Jobs = require('../lib/Jobs');
const Mcmmo = require('../lib/Mcmmo');
const ChestCommands = require('../lib/ChestCommands');
const Upload = require('../lib/AzureBlobUpload');
const Donwload = require('../lib/AzureFileDownload');
const path = require('path')
const fs = require('fs')

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);
    

    const jobsDbPath = path.join(__dirname, 'jobs.sqlite.db');

    const upload = new Upload(process.env.UPLOAD_BLOB_ACCOUNT, process.env.UPLOAD_BLOB_SAS, process.env.UPLOAD_BLOB_CONTAINER);
    const download = new Donwload(process.env.DOWNLOAD_FILE_ACCOUNT, process.env.DOWNLOAD_FILE_SAS, process.env.DOWNLOAD_FILE_SHARE)

    download
        .readString('plugins/mcMMO/flatfile/mcmmo.users')
        .then((data) => {
            return new Promise((resolve, reject) => {
                const mcmmo = new Mcmmo(data);
                mcmmo.do((err, result) => {
                    // console.log(result)
                    if (err) return reject(err)
                    resolve(result)
                }); 
            })
        })
        .then((result) => {
            return upload.writeJson('mcmmo.json', result);
        });

    download
        .readString('plugins/ChestCommands/menu/default.yml')
        .then((data) => {
            return new Promise((resolve, reject) => {
                const chestCommands = new ChestCommands(data);
                chestCommands.do((err, result) => {
                    // console.log(result)
                    if (err) return reject(err)
                    resolve(result)
                });
            })
        })
        .then((result) => {
            upload.writeJson('menu.json', result);
        })

    // download
    //     .readBinary('plugins/Jobs/jobs.sqlite.db')
    //     .then((data) => {
    //         return new Promise((resolve, reject) => {
    //             fs.writeFileSync(jobsDbPath, data);
    //             const jobs = new Jobs(jobsDbPath);
    //             jobs.do((err, result) => {
    //                 // console.log(points, ranks)
    //                 if (err) return reject(err)
    //                 resolve(result)
    //             });
    //         })
    //     })
    //     .then(({points, ranks}) => {
    //         upload.writeJson('jobs_rank.json', ranks);
    //         upload.writeJson('jobs_point.json', points);
    //     })
};