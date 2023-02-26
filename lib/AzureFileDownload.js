const { ShareServiceClient } = require("@azure/storage-file-share");

module.exports = class AzureFileDownload {
    constructor(account, sas, shareName) {
        this.serviceClientWithSAS = new ShareServiceClient(`https://${account}.file.core.windows.net${sas}`);
        this.fileClient = this.serviceClientWithSAS.getShareClient(shareName);
    }

    readString(fileName) {
        return this.readBinary(fileName)
            .then((buffer) => {
                return buffer.toString()
            })
    }

    readBinary(fileName) {
        const fileClient = this.fileClient.rootDirectoryClient.getFileClient(fileName);
        return fileClient
            .download()
            .then((downloadFileResponse) => {
                return this.streamToBuffer(downloadFileResponse.readableStreamBody)
            })
    }

    async streamToBuffer(readableStream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on("data", (data) => {
                chunks.push(data instanceof Buffer ? data : Buffer.from(data));
            });
            readableStream.on("end", () => {
                resolve(Buffer.concat(chunks));
            });
            readableStream.on("error", reject);
        });
    }
}

