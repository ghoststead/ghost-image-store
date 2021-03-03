const fs = require('fs');
const path = require('path');
const os = require('os');

const rimraf = require('rimraf');

const utils = require('../../lib/utils');

describe('utils', () => {
    describe('findConfigJson', () => {
        it('should find production.json', () => {
            expect.assertions(1);

            const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
            process.chdir(tmpDir);

            const startPath = path.join(tmpDir, './content/storage/adapters');
            fs.mkdirSync(startPath, {recursive: true});

            const config = {
                url: 'http://localhost:2368/blog'
            };

            const filePath = path.join(tmpDir, 'config.production.json');
            fs.writeFileSync(filePath, JSON.stringify(config));

            expect(utils.findConfigJson(startPath)).toStrictEqual(filePath);
            
            process.chdir(__dirname);
            rimraf.sync(tmpDir);
        });

        it('should load development.json', () => {
            expect.assertions(1);

            const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
            process.chdir(tmpDir);

            const startPath = path.join(tmpDir, './content/storage/adapters');
            fs.mkdirSync(startPath, {recursive: true});

            const config = {
                url: 'http://localhost:2368/blog'
            };

            const filePath = path.join(tmpDir, 'config.development.json');
            fs.writeFileSync(filePath, JSON.stringify(config));

            const expected = Object.assign({
                _configPath: filePath
            }, config);
            expect(utils.loadConfig(startPath)).toStrictEqual(expected);

            process.chdir(__dirname);
            rimraf.sync(tmpDir);
        });

        it('should return null', () => {
            expect.assertions(2);
            expect(utils.findConfigJson()).toBeNull();
            expect(utils.findConfigJson('/')).toBeNull();
        });

        it('should load empty config', () => {
            expect.assertions(1);
            expect(utils.loadConfig()).toStrictEqual({});
        });
    });
});