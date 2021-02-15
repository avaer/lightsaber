const rarities = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

const SaberType = [ "Light", "Dark" ]
const SaberTypeRarity = [ 75, 25 ].map(n => n / 100)

const BladeColor = {
  Light : ["Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "White" ],
  Dark: ["Red", "Orange", "Yellow", "Purple", "Silver", "Black"]
};

const BladeColorRarity = {
  Light: [40, 24, 14, 10, 8, 3.5, .5].map(n => n / 100),
  Dark: [50, 20, 20, 7, 2.6, .4].map(n => n / 100)
}

const EmitterType = {
  Light: ["CommonOne", "CommonTwo", "CommonThree", "CommonFour", "CommonFive", "CommonSix", "RareSeven", "RareEight", "EpicNine"],
  Dark: ["CommonOne", "CommonTwo", "CommonThree", "CommonFour", "RareFive", "RareSix", "EpicSeven"]
}

const EmitterTypeRarity = {
  Light: [30, 26, 18, 14, 8, 3.9, .1].map(n => n / 100),
  Dark: [40, 30, 20, 9, .9, .1].map(n => n / 100)
}

const SwitchType = {
  Light: ["CommonOne", "CommonTwo", "CommonThree", "CommonFour", "CommonFive", "CommonSix", "RareSeven", "RareEight", "EpicNine"],
  Dark: ["CommonOne", "CommonTwo", "CommonThree", "CommonFour", "RareFive", "RareSix", "EpicSeven"]
}

const SwitchTypeRarity = {
  Light: [24, 20, 18, 16, 12, 7, 2, .8, .2].map(n => n / 100),
  Dark: [28, 26, 22, 16, 5, 2.8, .2].map(n => n / 100)
}

const PommelType = {
  Light: ["CommonOne", "CommonTwo", "CommonThree", "CommonFour", "CommonFive", "CommonSix", "RareSeven", "RareEight", "EpicNine"],
  Dark: ["CommonOne", "CommonTwo", "CommonThree", "CommonFour", "RareFive", "RareSix", "EpicSeven"]
}

const PommelTypeRarity = {
  Light: [24, 20, 18, 16, 12, 7, 2, .8, .2].map(n => n / 100),
  Dark: [28, 26, 22, 16, 5, 2.8, .2].map(n => n / 100)
}

const SpecialFeature = {
  Light: [ "None", "Guard", "ShortBlade"],
  Dark: [ "None", "Crossguard", "DoubleSided" ]
}

const SpecialFeatureRarity = {
  Light: [98.5, 1.25, .25].map(n => n / 100),
  Dark: [92, 6, 2].map(n => n / 100)
}

const ColorScheme = {
  Light: ["LightSilverBlack", "LightSilverBlue", "LightSilverRed", "LightWhitePink", "LightSilverGold", "LightGoldWhite"],
  Dark: ["DarkBlackRed", "DarkBlackPurple", "DarkBlackPink", "DarkBlackGreen", "DarkBlackGold", "DarkGoldBlack"]
}

const ColorSchemeRarity = {
  Light: [48, 24, 12, 8, 4, 2].map(n => n / 100),
  Dark: [48, 24, 12, 8, 4, 2].map(n => n / 100)
}

const getTableOutput = ((randomNumber, table, factors) => {
  let totalFactor = 0;
  for (let i = 0; i < factors.length; i++) {
    totalFactor += factors[i];
    if (randomNumber <= totalFactor) {
      return table[i];
    }
  }
  return table[table.length - 1];
});

export default function generateLightsaberStats({
  art,
  stats,
}, alreadyCreatedSabers = []) {

  const rarityModifierFactor = .1;
  const fixedRarityModifierFactor = .01;

  // Rarity modifier
  let rarityModifier = 0;
  let fixedRarityModifier = 0;
  let rarity = "";

  for (let i = 0; i < rarities.length; i++) {
    if (rarities[i] == stats.rarity) {
      rarityModifier = i * rarityModifierFactor;
      fixedRarityModifier = i * fixedRarityModifierFactor;
      rarity = stats.rarity;
      break;
    }
  }

  // Is light or dark?
  const bladeType = getTableOutput(stats.level / 100 + (stats.hp / 255 * rarityModifier), SaberType, SaberTypeRarity);

  // BladeColor
  const bladeColor = getTableOutput(stats.magic / 255, BladeColor[bladeType], BladeColorRarity[bladeType]);

  // EmitterType
  const emitterType = getTableOutput(stats.attack / 255 + (stats.speed / 255 * rarityModifier) + fixedRarityModifier, EmitterType[bladeType], EmitterTypeRarity[bladeType]);

  // SwitchType
  const switchType = getTableOutput(stats.hp / 255 + (stats.accuracy / 255 * rarityModifier) + fixedRarityModifier, SwitchType[bladeType], SwitchTypeRarity[bladeType]);

  // PommelType
  const pommelType = getTableOutput(stats.defense / 255 + (stats.evasion / 255 * rarityModifier) + fixedRarityModifier, PommelType[bladeType], PommelTypeRarity[bladeType]);

  // SpecialFeature
  const featureType = getTableOutput(stats.magicDefense / 255 + fixedRarityModifier, SpecialFeature[bladeType], SpecialFeatureRarity[bladeType]);

  // ColorScheme
  const colorScheme = getTableOutput(stats.mp / 255 + (stats.luck / 255 * rarityModifier), ColorScheme[bladeType], ColorSchemeRarity[bladeType]);

  let hash = rarity + " | " + bladeType + " | " + bladeColor + " | " + emitterType + " | " +  switchType + " | " +  pommelType + " | " +  featureType + " | " + colorScheme;
  const alreadyExists = false; // alreadyCreatedSabers.filter(saber => hash == saber.hash).length > 0;

  const saber = {
    rarity,
    bladeType,
    bladeColor,
    emitterType,
    switchType,
    pommelType,
    featureType,
    colorScheme,
    duplicate: alreadyExists,
    hash: hash
  }

  alreadyCreatedSabers.push(saber);

  return saber;
}
