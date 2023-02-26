const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = class AzureBlobUpload {
    constructor(account, sas, containerName) {
        this.blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net${sas}`);
        this.containerClient = this.blobServiceClient.getContainerClient(containerName);
    }

    writeJson(blobName, contentObject) {
        const content = JSON.stringify(contentObject)
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        return blockBlobClient.upload(content, content.length);
    }
}