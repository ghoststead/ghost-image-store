const path = require('path');
const os = require('os');

const sharp = require('sharp');
const fs = require('fs-extra');
const rimraf = require('rimraf');

jest.mock('../../lib/config');
// for moment
jest.spyOn(Date, 'now').mockImplementation().mockReturnValue(new Date('2021-01-01T00:00:00'));

describe('image-file-store', () => {
    describe('save', () => {
        it('should save two images', async () => {
            expect.assertions(3);

            const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
            process.chdir(tmpDir);

            await sharp({
                create: {
                    width: 300,
                    height: 200,
                    channels: 4,
                    background: {r: 255, g: 0, b: 0, alpha: 0.5}
                }
            }).jpeg({quality: 80}).toFile('12345.jpg');
            const buffer = await fs.readFile('12345.jpg');

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const image = {
                path: '12345.jpg',
                name: 'IMAGE_o.jpg',
                type: 'image/jpeg'
            };
            const result = await ifs.save(image);
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.jpg');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.jpg'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE_o.webp');
            expect(fs.pathExistsSync(webpPath)).toBeTruthy();

            process.chdir(__dirname);
            rimraf.sync(tmpDir);
        });

        it('should fail to convert tiff', async () => {
            expect.assertions(3);

            const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
            process.chdir(tmpDir);

            await sharp({
                create: {
                    width: 300,
                    height: 200,
                    channels: 4,
                    background: {r: 255, g: 0, b: 0, alpha: 0.5}
                }
            }).tiff().toFile('12345.tiff');
            const buffer = await fs.readFile('12345.tiff');

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const image = {
                path: '12345.tiff',
                name: 'IMAGE_o.tiff',
                type: 'image/tiff'
            };
            const result = await ifs.save(image);
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.tiff');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.tiff'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE_o.webp');
            expect(!fs.pathExistsSync(webpPath)).toBeTruthy();

            process.chdir(__dirname);
            rimraf.sync(tmpDir);
        });

        it('should output only non-original image', async () => {
            expect.assertions(3);

            const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
            process.chdir(tmpDir);

            await sharp({
                create: {
                    width: 300,
                    height: 200,
                    channels: 4,
                    background: {r: 255, g: 0, b: 0, alpha: 0.5}
                }
            }).jpeg({quality: 80}).toFile('12345.jpg');
            const buffer = await fs.readFile('12345.jpg');

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const image = {
                path: '12345.jpg',
                name: 'IMAGE.jpg',
                type: 'image/jpeg'
            };
            const result = await ifs.save(image);
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE.jpg');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE.jpg'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE.webp');
            expect(!fs.pathExistsSync(webpPath)).toBeTruthy();

            process.chdir(__dirname);
            rimraf.sync(tmpDir);
        });

        it('should fail webp conversion', async () => {
            expect.assertions(4);

            const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
            process.chdir(tmpDir);

            await sharp({
                create: {
                    width: 300,
                    height: 200,
                    channels: 4,
                    background: {r: 255, g: 0, b: 0, alpha: 0.5}
                }
            }).jpeg({quality: 80}).toFile('12345.jpg');
            const buffer = await fs.readFile('12345.jpg');

            const toFile = jest.spyOn(sharp.prototype, 'toFile').mockImplementationOnce(() => {
                return Promise.reject({message: 'failed'});
            });
            const consoleError = jest.spyOn(global.console, 'error').mockImplementationOnce(() => {
            });

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const image = {
                path: '12345.jpg',
                name: 'IMAGE_o.jpg',
                type: 'image/jpeg'
            };
            const result = await ifs.save(image);
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.jpg');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.jpg'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE_o.webp');
            expect(!fs.pathExistsSync(webpPath)).toBeTruthy();

            // eslint-disable-next-line jest/prefer-called-with
            expect(consoleError).toHaveBeenCalled();

            process.chdir(__dirname);
            rimraf.sync(tmpDir);
            toFile.mockClear();
            consoleError.mockClear();
        });

        it('should fail saveAs', async () => {
            expect.assertions(1);

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const saveAs = jest.spyOn(ifs, 'saveAs').mockImplementationOnce(() => {
                return Promise.reject('failed');
            });

            await expect(ifs.save()).rejects.toStrictEqual('failed');

            saveAs.mockClear();
        });
    });

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

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const result = await ifs.saveRaw(buffer, '/2021/01/IMAGE_o.jpg');
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.jpg');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.jpg'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE_o.webp');
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

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const result = await ifs.saveRaw(buffer, '/2021/01/IMAGE_o.tiff');
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.tiff');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.tiff'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE_o.webp');
            expect(fs.pathExistsSync(webpPath)).toBeFalsy();

            process.chdir(__dirname);
            rimraf.sync(tmpDir);
        });

        it('should output only non-original image', async () => {
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
            }).jpeg().toBuffer();

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const result = await ifs.saveRaw(buffer, '/2021/01/IMAGE.jpg');
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE.jpg');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE.jpg'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE.webp');
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

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const result = await ifs.saveRaw(buffer, '/2021/01/IMAGE_o.jpg');
            expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE_o.jpg');

            const content = fs.readFileSync(path.join(tmpDir, './content/images/2021/01/IMAGE_o.jpg'));
            expect(content.equals(buffer)).toBeTruthy();

            const webpPath = path.resolve(tmpDir, './content/images/2021/01/IMAGE.webp');
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

            const ImageFileStorage = require('../../index');
            const ifs = new ImageFileStorage();

            const saveAs = jest.spyOn(ifs, 'saveRawAs').mockImplementationOnce(() => {
                return Promise.reject('failed');
            });

            await expect(ifs.saveRaw(

            )).rejects.toStrictEqual('failed');

            saveAs.mockClear();
        });
    });
});
