require('dotenv').config();
const Jobs = require('./Jobs');
const Mcmmo = require('./Mcmmo');
const ChestCommands = require('./ChestCommands');
const Upload = require('./Upload');

const uploadApiUrl = process.env.UPLOAD_API_URL;
const upload = new Upload(uploadApiUrl);

const jobs = new Jobs();
jobs.do((err, {points, ranks}) => {
    upload.write('jobs_rank.json', ranks);
    upload.write('jobs_point.json', points);
});

const mcmmo = new Mcmmo(uploadApiUrl);
mcmmo.do();

const chestCommands = new ChestCommands(uploadApiUrl);
chestCommands.do();
