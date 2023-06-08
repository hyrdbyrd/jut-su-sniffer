import { mkExt, mkFileName, mkFilePath, mkFolderPath, mkSeason, mkSeria } from './names';

describe('entity/names', () => {
    it('mkExt', () => {
        expect(mkExt('https://some-domain.com/some/path/to/file.png')).toEqual('.png');
        expect(mkExt('fa.')).toEqual('.mp4');
    });

    it('mkFileName', () => {
        expect(mkFileName('s1s1', '.mp3')).toEqual('s1s1.mp3');
        expect(mkFileName('s2s2')).toEqual('s2s2.mp4');
    });

    it('mkFilePath', () => {
        expect(mkFilePath('somepath', { season: 1, seria: 1, text: 's1s1', href: 'https://somepath/yo.vaw' })).toEqual(
            'somepath/S1/1.vaw'
        );
    });

    it('mkFolderPath', () => {
        expect(mkFolderPath('folder/path', { season: 1, seria: 1, text: 's1s1', href: 'https://fa.com' })).toEqual(
            'folder/path/S1'
        );
    });

    it('mkSeason', () => {
        expect(mkSeason(1)).toEqual('S1');
    });

    it('mkSeria', () => {
        expect(mkSeria({ seria: 1, season: 1, href: 'some.vaw', text: 'some-text' })).toEqual('1.vaw');
        expect(mkSeria({ seria: 2, season: 2, href: 'some.mp3', text: 'some-text', full: true })).toEqual('s2s2.mp3');
    });
});
