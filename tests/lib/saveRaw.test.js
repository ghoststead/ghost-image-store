const path = require('path');
const os = require('os');

const sharp = require('sharp');
const fs = require('fs-extra');
const rimraf = require('rimraf');

jest.mock('../../lib/config');
// for moment
jest.spyOn(Date, 'now').mockImplementation().mockReturnValue(new Date('2021-01-01T00:00:00'));

describe('saveRaw', () => {
    it('should output two images', async () => {
        expect.assertions(3);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        const buffer = await sharp({
            create: {
                width: 300,
                height: 200,
                channels: 4,
                background: {r: 255, g: 0, b: 0, alpha: 0.5}
            }
        }).jpeg({quality: 80}).toBuffer();

        const ImageFileStore = require('../../index');
        const store = new ImageFileStore();

        const result = await store.saveRaw(buffer, '/2021/01/IMAGE_o.jpg');
        expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.jpg');

        const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.jpg'));
        expect(content.equals(buffer)).toBeTruthy();

        const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE_o.jpg.webp');
        expect(fs.pathExistsSync(webpPath)).toBeTruthy();

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should fail to convert tiff', async () => {
        expect.assertions(3);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        const buffer = await sharp({
            create: {
                width: 300,
                height: 200,
                channels: 4,
                background: {r: 255, g: 0, b: 0, alpha: 0.5}
            }
        }).tiff().toBuffer();

        const ImageFileStore = require('../../index');
        const store = new ImageFileStore();

        const result = await store.saveRaw(buffer, '/2021/01/IMAGE_o.tiff');
        expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.tiff');

        const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.tiff'));
        expect(content.equals(buffer)).toBeTruthy();

        const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE_o.jpg.webp');
        expect(fs.pathExistsSync(webpPath)).toBeFalsy();

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should fail webp conversion', async () => {
        expect.assertions(4);

        const toFile = jest.spyOn(sharp.prototype, 'toFile').mockImplementation(() => {
            return Promise.reject({message: 'failed'});
        });
        const consoleError = jest.spyOn(global.console, 'error').mockImplementation(() => {
        });

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        const buffer = await sharp({
            create: {
                width: 300,
                height: 200,
                channels: 4,
                background: {r: 255, g: 0, b: 0, alpha: 0.5}
            }
        }).jpeg().toBuffer();

        const ImageFileStore = require('../../index');
        const store = new ImageFileStore();

        const result = await store.saveRaw(buffer, '/2021/01/IMAGE_o.jpg');
        expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.jpg');

        const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.jpg'));
        expect(content.equals(buffer)).toBeTruthy();

        const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE.jpg.webp');
        expect(fs.pathExistsSync(webpPath)).toBeFalsy();
        // eslint-disable-next-line jest/prefer-called-with
        expect(consoleError).toHaveBeenCalled();

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
        toFile.mockClear();
        consoleError.mockClear();
    });

    it('should fail saveRawAs', async () => {
        expect.assertions(1);

        const ImageFileStore = require('../../index');
        const store = new ImageFileStore();

        const saveAs = jest.spyOn(store, 'saveRawAs').mockImplementationOnce(() => {
            return Promise.reject('failed');
        });

        await expect(store.saveRaw()).rejects.toStrictEqual('failed');

        saveAs.mockClear();
    });
});
