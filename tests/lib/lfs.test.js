const path = require('path');
const os = require('os');

const fs = require('fs-extra');

const rimraf = require('rimraf');

jest.mock('../../lib/config');
// for moment
jest.spyOn(Date, 'now').mockImplementation().mockReturnValue(new Date('2021-01-01T00:00:00'));

describe('local-file-store', () => {
    it('should create a class instance', () => {
        expect.assertions(1);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);
        fs.mkdirSync('./content/images', {recursive: true});

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const storagePath = path.resolve(process.cwd(), 'content', 'images');
        expect(lfs.storagePath).toStrictEqual(storagePath);

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should save a raw buffer', async () => {
        expect.assertions(2);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);
        fs.mkdirSync('./content/images', {recursive: true});

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const buffer = Buffer.from('test');
        const result = await lfs.saveRaw(buffer, '/2021/01/01/test.txt');
        expect(result).toStrictEqual('/blog/content/images/2021/01/01/test.txt');

        const filePath = path.resolve(tmpDir, 'content', 'images', '2021', '01', '01', 'test.txt');
        expect(fs.readFileSync(filePath, 'utf-8')).toStrictEqual('test');

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should save image', async () => {
        expect.assertions(2);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        fs.writeFileSync('12345.jpg', 'test');

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const image = {
            path: '12345.jpg',
            name: 'IMAGE.jpg',
            type: 'image/jpeg'
        };
        const result = await lfs.save(image);
        expect(result).toStrictEqual('/blog/content/images/2021/01/IMAGE.jpg');

        const content = fs.readFileSync(path.join(tmpDir, '/content/images/2021/01/IMAGE.jpg'), 'utf-8');
        expect(content).toStrictEqual('test');

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should throw error on save', async () => {
        expect.assertions(1);

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        jest.spyOn(lfs, 'getUniqueFileName').mockImplementation(() => {
            return Promise.reject('xxx');
        });

        await expect(lfs.save()).rejects.toStrictEqual('xxx');
    });

    it('should test exists', async () => {
        expect.assertions(2);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        fs.mkdirSync('content/images', {recursive: true});
        fs.writeFileSync('content/images/12345.jpg', '');

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        expect(await lfs.exists('12345.jpg')).toBeTruthy();
        expect(await lfs.exists('54321.jpg')).toBeFalsy();

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should serve static content', async () => {
        expect.assertions(3);

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const res = {
            setHeader: jest.fn(),
            end: jest.fn()
        };

        const serveStaticContent = lfs.serve();
        expect(serveStaticContent({}, res)).toBeUndefined();
        // eslint-disable-next-line jest/prefer-called-with
        expect(res.setHeader).toHaveBeenCalledTimes(2);
        // eslint-disable-next-line jest/prefer-called-with
        expect(res.end).toHaveBeenCalled();
    });

    it('should serve next', async () => {
        expect.assertions(1);

        const spy = jest.spyOn(require('express'), 'static').mockImplementation(() => {
            return function (req, res, cb) {
                cb();
            };
        });

        const next = jest.fn();

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const res = {
            setHeader: jest.fn(),
            end: jest.fn()
        };

        const serveStaticContent = lfs.serve();
        serveStaticContent({}, res, next);
        // eslint-disable-next-line jest/prefer-called-with
        expect(next).toHaveBeenCalled();
        spy.mockClear();
    });

    it('should serve 404', async () => {
        expect.assertions(1);

        const spy = jest.spyOn(require('express'), 'static').mockImplementation(() => {
            return function (req, res, cb) {
                cb({
                    statusCode: 404
                });
            };
        });

        const next = jest.fn();

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const res = {
            setHeader: jest.fn(),
            end: jest.fn()
        };

        const serveStaticContent = lfs.serve();
        serveStaticContent({}, res, next);
        // eslint-disable-next-line jest/prefer-called-with
        expect(next).toHaveBeenCalled();
        spy.mockClear();
    });

    it('should serve 400', async () => {
        expect.assertions(1);

        const spy = jest.spyOn(require('express'), 'static').mockImplementation(() => {
            return function (req, res, cb) {
                cb({
                    statusCode: 400
                });
            };
        });

        const next = jest.fn();

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const res = {
            setHeader: jest.fn(),
            end: jest.fn()
        };

        const serveStaticContent = lfs.serve();
        serveStaticContent({}, res, next);
        // eslint-disable-next-line jest/prefer-called-with
        expect(next).toHaveBeenCalled();
        spy.mockClear();
    });

    it('should serve 403', async () => {
        expect.assertions(1);

        const spy = jest.spyOn(require('express'), 'static').mockImplementation(() => {
            return function (req, res, cb) {
                cb({
                    statusCode: 403
                });
            };
        });

        const next = jest.fn();

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const res = {
            setHeader: jest.fn(),
            end: jest.fn()
        };

        const serveStaticContent = lfs.serve();
        serveStaticContent({}, res, next);
        // eslint-disable-next-line jest/prefer-called-with
        expect(next).toHaveBeenCalled();
        spy.mockClear();
    });

    it('should serve generic error', async () => {
        expect.assertions(1);

        const spy = jest.spyOn(require('express'), 'static').mockImplementation(() => {
            return function (req, res, cb) {
                cb({
                    statusCode: 500
                });
            };
        });

        const next = jest.fn();

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const res = {
            setHeader: jest.fn(),
            end: jest.fn()
        };

        const serveStaticContent = lfs.serve();
        serveStaticContent({}, res, next);
        // eslint-disable-next-line jest/prefer-called-with
        expect(next).toHaveBeenCalled();
        spy.mockClear();
    });

    it('should show delete not implemented', async () => {
        expect.assertions(1);
        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();
        await expect(lfs.delete()).rejects.toStrictEqual('not implemented');
    });

    it('should read image', async () => {
        expect.assertions(1);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        const buf = Buffer.from([1, 2, 3]);
        fs.mkdirSync('content/images/2021/01/', {recursive: true});
        fs.writeFileSync('content/images/2021/01/IMAGE.jpg', buf);

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const result = await lfs.read({
            path: '/2021/01/IMAGE.jpg'
        });
        expect(result.equals(result)).toBeTruthy();

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should read ENOENT', async () => {
        expect.assertions(1);

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        let errorCode;
        try {
            await lfs.read();
        } catch (err) {
            errorCode = err.code;
        }
        expect(errorCode).toStrictEqual('ENOENT');
    });

    it('should read ENAMETOOLONG', async () => {
        expect.assertions(1);

        const spy = jest.spyOn(fs, 'readFile').mockImplementation((targetPath, cb) => {
            cb({code: 'ENAMETOOLONG'}, Buffer.from([]));
        });

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        let errorCode;
        try {
            await lfs.read({
                path: '/2021/01/IMAGE.jpg'
            });
        } catch (err) {
            errorCode = err.code;
        }
        expect(errorCode).toStrictEqual('ENAMETOOLONG');
        spy.mockClear();
    });

    it('should read EACCESS', async () => {
        expect.assertions(1);

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        const spy = jest.spyOn(fs, 'readFile').mockImplementation((targetPath, cb) => {
            cb({code: 'EACCES'}, Buffer.from([]));
        });

        let errorCode;
        try {
            await lfs.read({
                path: '/2021/01/IMAGE.jpg'
            });
        } catch (err) {
            errorCode = err.code;
        }
        expect(errorCode).toStrictEqual('EACCES');
        spy.mockClear();
    });

    it('should read generic error', async () => {
        expect.assertions(1);

        jest.spyOn(fs, 'readFile').mockImplementation((targetPath, cb) => {
            cb({code: 'XXX'}, Buffer.from([]));
        });

        const LocalFileStorage = require('../../lib/lfs.js');
        const lfs = new LocalFileStorage();

        let message;
        try {
            await lfs.read({
                path: '/2021/01/IMAGE.jpg'
            });
        } catch (err) {
            message = err.message;
        }

        expect(message).toStrictEqual('Cannot read image: /2021/01/IMAGE.jpg');
        fs.readFile.mockClear();
    });
});
