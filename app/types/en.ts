const en = {
    welcome: "Welcome!",
    play: "Play Game",
    settings: "Settings",
    stars: "Stars to bet:",
    star_number:"Coins:",
    chi: 'Chi',
    pon: 'Pon',
    kan: 'Kan',
    ron: 'Hu',
    tsumo: 'Tsumo',
    skip: 'Skip',
    setting: 'Game Setting',
    language: 'Language:',
    savesetting: 'Save Setting',
    win: "You Win!",
    gameover: "Game Over",
    home: "Go Home",
    animation: "Animation Speed:",
};

export type TranslationKeys = keyof typeof en;
export type Translations = Record<TranslationKeys, string>;
export default en;