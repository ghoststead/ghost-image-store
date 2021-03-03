const path = require('path');

const fs = require('fs-extra');

const config = require('./config');

const UrlUtils = require('@tryghost/url-utils');
const urlUtils = new UrlUtils({
    url: config.url
});

/**
 * Saves the image to storage (the file system)
 * - image is the express image object
 * - returns a promise which ultimately returns the full url to the uploaded image
 *
 * @param image
 * @param targetDir
 * @returns {*}
 */
function saveAs(image, targetDir) {
    let targetFilename;

    // NOTE: the base implementation of `getTargetDir` returns the format this.storagePath/YYYY/MM
    targetDir = targetDir || this.getTargetDir(this.storagePath);

    return this.getUniqueFileName(image, targetDir).then((filename) => {
        targetFilename = filename;
        return fs.mkdirs(targetDir);
    }).then(() => {
        return fs.copy(image.path, targetFilename);
    }).then(() => {
        // The src for the image must be in URI format, not a file system path, which in Windows uses \
        // For local file system storage can use relative path so add a slash
        return {
            url: urlUtils.urlJoin('/', urlUtils.getSubdir(),
                urlUtils.STATIC_IMAGE_URL_PREFIX,
                path.relative(this.storagePath, targetFilename)
            ).replace(
                new RegExp(`\\${path.sep}`, 'g'), '/'
            ),
            path: targetFilename
        };
    }).catch((e) => {
        return Promise.reject(e);
    });
}

module.exports = function (Store) {
    Object.assign(Store.prototype, {
        saveAs
    });
};
