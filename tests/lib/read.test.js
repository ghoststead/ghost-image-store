const os = require('os');
const path = require('path');

const fs = require('fs-extra'); // use fs-extra since we mock it
const rimraf = require('rimraf');

jest.mock('../../lib/config');
// for moment
jest.spyOn(Date, 'now').mockImplementation().mockReturnValue(new Date('2021-01-01T00:00:00'));

describe('read', () => {
    it('should return image contents', async () => {
        expect.assertions(1);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        const buf = Buffer.from([1, 2, 3]);
        fs.mkdirSync('content/images/2021/01/', {recursive: true});
        fs.writeFileSync('content/images/2021/01/IMAGE.jpg', buf);

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        const result = await store.read({
            path: '/2021/01/IMAGE.jpg'
        });
        expect(result.equals(result)).toBeTruthy();

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should fail with ENOENT', async () => {
        expect.assertions(1);

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        let errorCode;
        try {
            await store.read();
        } catch (err) {
            errorCode = err.code;
        }
        expect(errorCode).toStrictEqual('ENOENT');
    });

    it('should fail with ENAMETOOLONG', async () => {
        expect.assertions(1);

        const spy = jest.spyOn(fs, 'readFile').mockImplementation((targetPath, cb) => {
            cb({code: 'ENAMETOOLONG'}, Buffer.from([]));
        });

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        let errorCode;
        try {
            await store.read({
                path: '/2021/01/IMAGE.jpg'
            });
        } catch (err) {
            errorCode = err.code;
        }
        expect(errorCode).toStrictEqual('ENAMETOOLONG');
        spy.mockClear();
    });

    it('should fail with EACCESS', async () => {
        expect.assertions(1);

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        const spy = jest.spyOn(fs, 'readFile').mockImplementation((targetPath, cb) => {
            cb({code: 'EACCES'}, Buffer.from([]));
        });

        let errorCode;
        try {
            await store.read({
                path: '/2021/01/IMAGE.jpg'
            });
        } catch (err) {
            errorCode = err.code;
        }
        expect(errorCode).toStrictEqual('EACCES');
        spy.mockClear();
    });

    it('should fail with a generic error', async () => {
        expect.assertions(1);

        jest.spyOn(fs, 'readFile').mockImplementation((targetPath, cb) => {
            cb({code: 'XXX'}, Buffer.from([]));
        });

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        let message;
        try {
            await store.read({
                path: '/2021/01/IMAGE.jpg'
            });
        } catch (err) {
            message = err.message;
        }

        expect(message).toStrictEqual('Cannot read image: /2021/01/IMAGE.jpg');
        fs.readFile.mockClear();
    });
});
