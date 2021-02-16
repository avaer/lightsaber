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
  Dark: ["Red", "Yellow", "Orange", "Purple", "Pink", "Silver", "Black"]
};

const BladeColorRarity = {
  Light: [34, 24, 16, 12, 10, 3.5, .5].map(n => n / 100),
  Dark: [46, 20, 18, 8, 5, 2.6, .4].map(n => n / 100)
}

const EmitterType = {
  Light: ["Light_Emitter_1", "Light_Emitter_2", "Light_Emitter_3", "Light_Emitter_4", "Light_Emitter_5", "Light_Emitter_6", "Light_Emitter_7", "Light_Emitter_8", "Light_Emitter_9"],
  Dark: ["Dark_Emitter_1", "Dark_Emitter_2", "Dark_Emitter_3", "Dark_Emitter_4", "Dark_Emitter_5", "Dark_Emitter_6", "Dark_Emitter_7"]
}

const EmitterTypeRarity = {
  Light: [30, 26, 18, 14, 8, 3.9, .1].map(n => n / 100),
  Dark: [40, 30, 20, 9, .9, .1].map(n => n / 100)
}

const SwitchType = {
  Light: ["Light_Switch_1", "Light_Switch_2", "Light_Switch_3", "Light_Switch_4", "Light_Switch_5", "Light_Switch_6", "Light_Switch_7", "Light_Switch_8", "Light_Switch_9"],
  Dark: ["Dark_Switch_1", "Dark_Switch_2", "Dark_Switch_3", "Dark_Switch_4", "Dark_Switch_5", "Dark_Switch_6", "Dark_Switch_7"]
}

const SwitchTypeRarity = {
  Light: [24, 20, 18, 16, 12, 7, 2, .8, .2].map(n => n / 100),
  Dark: [28, 26, 22, 16, 5, 2.8, .2].map(n => n / 100)
}

const HandleType = {
  Light: ["Light_Handle_1", "Light_Handle_2", "Light_Handle_3", "Light_Handle_4", "Light_Handle_5", "Light_Handle_6", "Light_Handle_7", "Light_Handle_8", "Light_Handle_9"],
  Dark: ["Dark_Handle_1", "Dark_Handle_2", "Dark_Handle_3", "Dark_Handle_4", "Dark_Handle_5", "Dark_Handle_6", "Dark_Handle_7"]
}

const HandleTypeRarity = {
  Light: [24, 20, 18, 16, 12, 7, 2, .8, .2].map(n => n / 100),
  Dark: [28, 26, 22, 16, 5, 2.8, .2].map(n => n / 100)
}

const SpecialFeature = {
  Light: [ "None", "Pommel", "Guard", "ShortBlade"],
  Dark: [ "None", "Pommel", "Crossguard", "DoubleSided" ]
}

const SpecialFeatureRarity = {
  Light: [90.5, 8, 1.25, .25].map(n => n / 100),
  Dark: [80, 12, 6, 2].map(n => n / 100)
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

  // HandleType
  const handleType = getTableOutput(stats.defense / 255 + (stats.evasion / 255 * rarityModifier) + fixedRarityModifier, HandleType[bladeType], HandleTypeRarity[bladeType]);

  // SpecialFeature
  const featureType = getTableOutput(stats.magicDefense / 255 + fixedRarityModifier, SpecialFeature[bladeType], SpecialFeatureRarity[bladeType]);

  // ColorScheme
  const colorScheme = getTableOutput(stats.mp / 255 + (stats.luck / 255 * rarityModifier), ColorScheme[bladeType], ColorSchemeRarity[bladeType]);

  let hash = rarity + " | " + bladeType + " | " + bladeColor + " | " + emitterType + " | " +  switchType + " | " +  handleType + " | " +  featureType + " | " + colorScheme;
  const alreadyExists = false; // alreadyCreatedSabers.filter(saber => hash == saber.hash).length > 0;

  const saber = {
    rarity,
    bladeType,
    bladeColor,
    emitterType,
    switchType,
    handleType,
    featureType,
    colorScheme,
    duplicate: alreadyExists,
    hash: hash
  }

  alreadyCreatedSabers.push(saber);

  return saber;
}
