const path = require('path');

const fs = require('fs-extra');

function exists(fileName, targetDir) {
    const filePath = path.join(targetDir || this.storagePath, fileName);

    return fs.stat(filePath)
        .then(() => {
            return true;
        })
        .catch(() => {
            return false;
        });
}

module.exports = function (Store) {
    Object.assign(Store.prototype, {
        exists
    });
};
