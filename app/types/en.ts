const en = {
    welcome: "Welcome!",
    play: "Play Game",
    settings: "Settings",
    stars: "Stars to bet:",
    star_number:"Stars:",
    chi: 'Chi',
    pon: 'Pon',
    kan: 'Kan',
    ron: 'Hu',
    tsumo: 'Tsumo',
    skip: 'Skip',
};

export type TranslationKeys = keyof typeof en;
export type Translations = Record<TranslationKeys, string>;
export default en;