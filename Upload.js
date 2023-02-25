const axios = require('axios');

module.exports = class Upload {
    constructor(uploadApiUrl) {
        this.uploadApiUrl = uploadApiUrl;
    }

    write(name, data) {
        return axios.post(this.uploadApiUrl, {name, data})
    }
}
