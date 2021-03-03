const fs = require('fs');
const path = require('path');

module.exports = {
    findConfigJson(dirPath) {
        if (!dirPath) {
            return null;
        }

        let filePath = path.join(dirPath, 'config.production.json');
        if (fs.existsSync(filePath)) {
            return filePath;
        }

        filePath = path.join(dirPath, 'config.development.json');
        if (fs.existsSync(filePath)) {
            return filePath;
        }

        if (dirPath === '/') {
            return null;
        }

        return this.findConfigJson(path.join(dirPath, '..'));
    },

    loadConfig(dirPath) {
        const configPath = this.findConfigJson(dirPath);
        if (configPath) {
            const result = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            result._configPath = configPath;
            return result;
        }
        return {};
    },

    fileExtension(targetPath) {
        return path.parse(targetPath).ext.toLowerCase();
    }
};