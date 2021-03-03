const path = require('path');

const fs = require('fs-extra');
const errors = require('@tryghost/errors');

/**
 * Reads bytes from disk for a target image
 * - path of target image (without content path!)
 *
 * @param options
 */
function read(options) {
    options = options || {};

    // remove trailing slashes
    options.path = (options.path || '').replace(/\/$|\\$/, '');

    const targetPath = path.join(this.storagePath, options.path);

    return new Promise((resolve, reject) => {
        fs.readFile(targetPath, (err, bytes) => {
            if (err) {
                if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                    return reject(new errors.NotFoundError({
                        err: err,
                        message: `Image not found: ${options.path}`
                    }));
                }

                if (err.code === 'ENAMETOOLONG') {
                    return reject(new errors.BadRequestError({err: err}));
                }

                if (err.code === 'EACCES') {
                    return reject(new errors.NoPermissionError({err: err}));
                }

                return reject(new errors.GhostError({
                    err: err,
                    message: `Cannot read image: ${options.path}`
                }));
            }

            resolve(bytes);
        });
    });
}

module.exports = function (Store) {
    Object.assign(Store.prototype, {
        read
    });
};
