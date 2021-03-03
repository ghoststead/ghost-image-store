describe('delete', () => {
    it('should show not implemented', async () => {
        expect.assertions(1);
        const LocalFileStorage = require('../../lib/store');
        const lfs = new LocalFileStorage();
        await expect(lfs.delete()).rejects.toStrictEqual('not implemented');
    });
});
