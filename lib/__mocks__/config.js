const path = require('path');

module.exports = {
    url: 'https://localhost:2368/blog',
    getContentPath(name) {
        return path.resolve(process.cwd(), 'content', name);
    }
};