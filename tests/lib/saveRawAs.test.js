const fs = require('fs');
const os = require('os');
const path = require('path');

const rimraf = require('rimraf');

jest.mock('../../lib/config');
// for moment
jest.spyOn(Date, 'now').mockImplementation().mockReturnValue(new Date('2021-01-01T00:00:00'));

describe('saveRawAs', () => {
    it('should save a raw buffer', async () => {
        expect.assertions(2);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);
        fs.mkdirSync('./content/images', {recursive: true});

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        const buffer = Buffer.from('test');
        const result = await store.saveRaw(buffer, '/2021/01/01/test.txt');
        expect(result).toStrictEqual('/blog/content/images/2021/01/01/test.txt');

        const filePath = path.resolve(tmpDir, 'content', 'images', '2021', '01', '01', 'test.txt');
        expect(fs.readFileSync(filePath, 'utf-8')).toStrictEqual('test');

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });
});
