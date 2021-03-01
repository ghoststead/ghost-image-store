const path = require('path');

const utils = require('./utils');

module.exports = Object.assign(utils.loadConfig(__dirname), {
    getContentPath(name) {
        if (this.paths && this.paths.contentPath) {
            return path.join(this.paths.contentPath, name);
        }

        return path.join(path.dirname(this._configPath), 'content', name);
    }
});
