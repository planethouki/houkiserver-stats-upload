require('dotenv').config();
const Jobs = require('./Jobs');
const Mcmmo = require('./Mcmmo');
const ChestCommands = require('./ChestCommands');
const Upload = require('./AzureBlobUpload');
const Donwload = require('./AzureFileDownload');
const JobsShop = require('./JobsShop');

const path = require('path')

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

download
    .readString('plugins/jobs/shopItems.yml')
    .then((data) => {
        return new Promise((resolve, reject) => {
            const jobsShop = new JobsShop(data);
            jobsShop.do((err, result) => {
                // console.log(result)
                if (err) return reject(err)
                resolve(result)
            });
        })
    })
    .then((result) => {
        upload.writeJson('shopItems.json', result);
    })

download
    .readBinary('plugins/Jobs/jobs.sqlite.db')
    .then((data) => {
        return new Promise((resolve, reject) => {
            const jobs = new Jobs(data);
            jobs.init().then(() => {
                jobs.do((err, result) => {
                    // console.log(result)
                    if (err) return reject(err)
                    resolve(result)
                });
            })
        })
    })
    .then(({points, ranks}) => {
        upload.writeJson('jobs_rank.json', ranks);
        upload.writeJson('jobs_point.json', points);
    })
