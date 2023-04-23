const Jobs = require('../lib/Jobs');
const Mcmmo = require('../lib/Mcmmo');
const ChestCommands = require('../lib/ChestCommands');
const Upload = require('../lib/AzureBlobUpload');
const Donwload = require('../lib/AzureFileDownload');

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);
    

    const upload = new Upload(process.env.UPLOAD_BLOB_ACCOUNT, process.env.UPLOAD_BLOB_SAS, process.env.UPLOAD_BLOB_CONTAINER);
    const download = new Donwload(process.env.DOWNLOAD_FILE_ACCOUNT, process.env.DOWNLOAD_FILE_SAS, process.env.DOWNLOAD_FILE_SHARE)

    const jobMcMMO = download
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

    const jobChestCommands = download
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

    const jobJobsShop = download
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
        
    const jobJobs = download
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
    

    await Promise.all([jobMcMMO, jobChestCommands, jobJobsShop, jobJobs]).catch((e) => {
        context.log.error(e)
    })
    

    context.log('JavaScript timer trigger function ran!', new Date().toISOString());
};