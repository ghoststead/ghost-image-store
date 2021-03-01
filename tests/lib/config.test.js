const config = require('../../lib/config');

describe('config', () => {
    it('getContentPath without paths', () => {
        expect.assertions(1);
        config._configPath = '/foo/content';
        config.paths = undefined;
        expect(config.getContentPath('images')).toStrictEqual('/foo/content/images');
    });

    it('getContentPath with paths', () => {
        expect.assertions(1);
        config.paths = {
            contentPath: '/bar/content'
        };
        expect(config.getContentPath('images')).toStrictEqual('/bar/content/images');
    });
});