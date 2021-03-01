const sharp = require('sharp');

const LocalFileStore = require('./lfs');
const utils = require('./utils');

/*
 * 80 might be 'too good'
 * https://www.jefftk.com/p/webp-quality-settings
 */
const WEBP_QUALITY = 80;

class ImageFileStore extends LocalFileStore {
    canConvertToWebP(ext) {
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    }

    saveRaw(buffer, targetPath) {
        return this.saveRawAs(buffer, targetPath).then((result) => {
            const ext = utils.fileExtension(result.path);
            if (!this.canConvertToWebP(ext)) {
                return result.url;
            }

            /* only convert the 'original' file, sized images are created as requested */
            if (!result.path.includes('_o.')) {
                return result.url;
            }

            const webpPath = utils.changeExtensionToWebP(result.path);
            return sharp(result.path).webp({quality: WEBP_QUALITY}).toFile(webpPath)
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

            /* only convert the 'original' file, sized images are created as requested */
            if (!result.path.includes('_o.')) {
                return result.url;
            }

            const webpPath = utils.changeExtensionToWebP(result.path);
            return sharp(result.path).webp({quality: WEBP_QUALITY}).toFile(webpPath)
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
}

module.exports = ImageFileStore;
