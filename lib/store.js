const sharp = require('sharp');

const StorageBase = require('ghost-storage-base');

const utils = require('./utils');
const config = require('./config');

/*
 * 80 might be 'too good'
 * https://www.jefftk.com/p/webp-quality-settings
 */
const WEBP_QUALITY = 80;
const SIZE_PATH_REGEX = /^\/size\/([^/]+)\//;

class ImageFileStore extends StorageBase {
    constructor(options = {}) {
        super(options);
        this.storagePath = config.getContentPath('images');
        this.webpQuality = options.webQuality || WEBP_QUALITY;
    }

    canConvertToWebP(ext) {
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    }

    saveRaw(buffer, targetPath) {
        return this.saveRawAs(buffer, targetPath).then((result) => {
            const ext = utils.fileExtension(result.path);
            if (!this.canConvertToWebP(ext)) {
                return result.url;
            }

            return sharp(result.path).webp({quality: this.webpQuality}).toFile(`${result.path }.webp`)
                .then(() => {
                    return result.url;
                })
                .catch((err) => {
                    console.error(`Failed to convert '${result.path} to webp: ${err.message}`);
                    return Promise.resolve(result.url);
                });
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    save(image, targetDir) {
        return this.saveAs(image, targetDir).then((result) => {
            const ext = utils.fileExtension(result.path);
            if (!this.canConvertToWebP(ext)) {
                return result.url;
            }

            return sharp(result.path).webp({quality: this.webpQuality}).toFile(`${result.path }.webp`)
                .then(() => {
                    return result.url;
                })
                .catch((err) => {
                    console.error(`Failed to convert '${result.path} to webp: ${err.message}`);
                    return Promise.resolve(result.url);
                });
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    /**
     * Not implemented.
     * @returns {Promise.<*>}
     */
    delete() {
        return Promise.reject('not implemented');
    }
}

require('./exists')(ImageFileStore);
require('./read')(ImageFileStore);
require('./serve')(ImageFileStore);
require('./saveAs')(ImageFileStore);
require('./saveRawAs')(ImageFileStore);

module.exports = ImageFileStore;
