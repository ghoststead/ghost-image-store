const fs = require('fs');
const os = require('os');
const path = require('path');

const rimraf = require('rimraf');

jest.mock('../../lib/config');
// for moment
jest.spyOn(Date, 'now').mockImplementation().mockReturnValue(new Date('2021-01-01T00:00:00'));

describe('saveAs', () => {
    it('should save image', async () => {
        expect.assertions(2);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        fs.writeFileSync('12345.jpg', 'test');

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        const image = {
            path: '12345.jpg',
            name: 'IMAGE.jpg',
            type: 'image/jpeg'
        };
        const result = await store.saveAs(image);
        expect(result.url).toStrictEqual('/blog/content/images/2021/01/IMAGE.jpg');

        const content = fs.readFileSync(path.join(tmpDir, '/content/images/2021/01/IMAGE.jpg'), 'utf-8');
        expect(content).toStrictEqual('test');

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });

    it('should throw error', async () => {
        expect.assertions(1);

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        jest.spyOn(store, 'getUniqueFileName').mockImplementation(() => {
            return Promise.reject('xxx');
        });

        await expect(store.save()).rejects.toStrictEqual('xxx');
    });
});
