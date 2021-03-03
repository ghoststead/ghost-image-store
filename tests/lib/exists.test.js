const fs = require('fs');
const os = require('os');
const path = require('path');

const rimraf = require('rimraf');

jest.mock('../../lib/config');

describe('exists', () => {
    it('should test two files', async () => {
        expect.assertions(2);

        const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep);
        process.chdir(tmpDir);

        fs.mkdirSync('content/images', {recursive: true});
        fs.writeFileSync('content/images/12345.jpg', '');

        const ImageFileStore = require('../../lib/store');
        const store = new ImageFileStore();

        expect(await store.exists('12345.jpg')).toBeTruthy();
        expect(await store.exists('54321.jpg')).toBeFalsy();

        process.chdir(__dirname);
        rimraf.sync(tmpDir);
    });
});
