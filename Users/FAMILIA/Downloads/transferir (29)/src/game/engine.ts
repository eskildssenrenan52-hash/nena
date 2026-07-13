import {
  Application, Container, Sprite, Texture, Rectangle, Graphics, Text,
  ColorMatrixFilter, NoiseFilter, BlurFilter,
} from "pixi.js";
import {
  TILE_SIZE, RENDER_SCALE, PLAYER_STEP_MS, ATTACK_COOLDOWN_MS,
  SKILL_XP_PER_HIT, skillXpForNext, xpForLevel,
  MONSTERS, BIOMES, scaleMonster, ABILITIES, ACHIEVEMENTS,
  DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP,
  CLASSES, type ClassId, type SkillId, type MonsterDef, type AbilityDef, type WeaponStyle,
} from "./config";
import { loadMap, isBlocked, nearestWalkable, stairAt, type WorldMap } from "./world";
import { loadSheet, loadTileset, type LoadedSheet } from "./sprites";

import heroWarriorUrl from "@/assets/hero-warrior.png";
import heroMageUrl from "@/assets/hero-mage.png";
import heroArcherUrl from "@/assets/hero-archer.png";
import heroPaladinUrl from "@/assets/hero-paladin.png";
import heroAssassinUrl from "@/assets/hero-assassin.png";
import heroBerserkerUrl from "@/assets/hero-berserker.png";
import heroElementalistUrl from "@/assets/hero-elementalist.png";
import heroNecromancerUrl from "@/assets/hero-necromancer.png";
import slimeUrl from "@/assets/slime.png";
import goblinUrl from "@/assets/goblin.png";
import tilesetUrl from "@/assets/tileset.png";
import tilesetMeadowUrl from "@/assets/tileset-meadow.png";
import tilesetMyceliumUrl from "@/assets/tileset-mycelium.png";
import tilesetClockworkUrl from "@/assets/tileset-clockwork.png";
import tilesetAbyssSeaUrl from "@/assets/tileset-abyss_sea.png";
import tilesetEmberlandsUrl from "@/assets/tileset-emberlands.png";
import tilesetShardveilUrl from "@/assets/tileset-shardveil.png";
import tilesetForestUrl from "@/assets/tileset-forest.png";
import tilesetDesertUrl from "@/assets/tileset-desert.png";
import tilesetTundraUrl from "@/assets/tileset-tundra.png";
import tilesetVolcanoUrl from "@/assets/tileset-volcano.png";
import tilesetRuinsUrl from "@/assets/tileset-ruins.png";
import tilesetCrystalUrl from "@/assets/tileset-crystal.png";
import tilesetSwampUrl from "@/assets/tileset-swamp.png";
import tilesetJungleUrl from "@/assets/tileset-jungle.png";
import tilesetSkyUrl from "@/assets/tileset-sky.png";
import tilesetAbyssUrl from "@/assets/tileset-abyss.png";
import tilesetFrostpeakUrl from "@/assets/tileset-frostpeak.png";
import tilesetSunkenTempleUrl from "@/assets/tileset-sunken_temple.png";
import tilesetNeonWastesUrl from "@/assets/tileset-neon_wastes.png";
import tilesetBloodmoonUrl from "@/assets/tileset-bloodmoon.png";
import tilesetCelestialUrl from "@/assets/tileset-celestial.png";
import tilesetAshenUrl from "@/assets/tileset-ashen.png";
import tilesetGloomwoodUrl from "@/assets/tileset-gloomwood.png";
import tilesetMireUrl from "@/assets/tileset-mire.png";
import tilesetRunesUrl from "@/assets/tileset-runes.png";
import tilesetVoidGateUrl from "@/assets/tileset-void_gate.png";
// Main city + 10 new biome tilesets (each now has its own unique AI-generated sheet)
import tilesetMainCityUrl from "@/assets/tileset-main_city.png";
import tilesetCrimsonDunesUrl from "@/assets/tileset-crimson_dunes.png";
import tilesetSeraphGroveUrl from "@/assets/tileset-seraph_grove.png";
import tilesetHoneycombUrl from "@/assets/tileset-honeycomb_hive.png";
import tilesetCosmicBazaarUrl from "@/assets/tileset-cosmic_bazaar.png";
import tilesetObsidianReefUrl from "@/assets/tileset-obsidian_reef.png";
import tilesetThunderveilUrl from "@/assets/tileset-thunderveil.png";
import tilesetGlassDesertUrl from "@/assets/tileset-glass_desert.png";
import tilesetMirrorLakeUrl from "@/assets/tileset-mirror_lake.png";
import tilesetPlasmaBogUrl from "@/assets/tileset-plasma_bog.png";
import tilesetCursedOrchardUrl from "@/assets/tileset-cursed_orchard.png";
// 10 new endgame biome tilesets (Lv 75+)
import tilesetSunspireUrl from "@/assets/tileset-sunspire.png";
import tilesetMoonshadeUrl from "@/assets/tileset-moonshade.png";
import tilesetStormforgeUrl from "@/assets/tileset-stormforge.png";
import tilesetDreamweaveUrl from "@/assets/tileset-dreamweave.png";
import tilesetBoneWastesUrl from "@/assets/tileset-bone_wastes.png";
import tilesetVenomGroveUrl from "@/assets/tileset-venom_grove.png";
import tilesetMagmaCoreUrl from "@/assets/tileset-magma_core.png";
import tilesetAstralVoidUrl from "@/assets/tileset-astral_void.png";
import tilesetNightmareGateUrl from "@/assets/tileset-nightmare_gate.png";
import tilesetTitanRuinsUrl from "@/assets/tileset-titan_ruins.png";
// NPC sheets
import npcBankerUrl from "@/assets/npc-banker.png";
import npcDummyUrl from "@/assets/npc-dummy.png";
import npcBlacksmithUrl from "@/assets/npc-blacksmith.png";
// Dedicated enemy sheets (each with a unique base sprite).
import enemyCrimsonWyrmUrl from "@/assets/enemy-crimson_wyrm.png";
import enemyAbyssSlimeUrl from "@/assets/enemy-abyss_slime.png";
import enemyBogToadUrl from "@/assets/enemy-bog_toad.png";
import enemyBoneKnightUrl from "@/assets/enemy-bone_knight.png";
import enemyCinderFiendUrl from "@/assets/enemy-cinder_fiend.png";
import enemyCogSentinelUrl from "@/assets/enemy-cog_sentinel.png";
import enemyJungleSerpentUrl from "@/assets/enemy-jungle_serpent.png";
import enemyLanternMawUrl from "@/assets/enemy-lantern_maw.png";
import enemyMarshWitchUrl from "@/assets/enemy-marsh_witch.png";
import enemyShadowHoundUrl from "@/assets/enemy-shadow_hound.png";
import enemyShardWidowUrl from "@/assets/enemy-shard_widow.png";
import enemySkySpriteUrl from "@/assets/enemy-sky_sprite.png";
import enemySporeWalkerUrl from "@/assets/enemy-spore_walker.png";
import enemyStormEagleUrl from "@/assets/enemy-storm_eagle.png";
import enemyVineBeastUrl from "@/assets/enemy-vine_beast.png";
import enemyVoidStalkerUrl from "@/assets/enemy-void_stalker.png";
import {
  EQUIP_SLOTS, EQUIP_DROP_CHANCE, GEM_DROP, GEMS,
  makeDropItem, equipmentBonuses, gemForUpgrade, GEMS_PER_UPGRADE,
  type EquipSlot, type EquipItem, type Rarity, type Gem,
} from "./equipment";

export interface Skills { defense: number; melee: number; archer: number; mage: number; }
export interface SkillXp { defense: number; melee: number; archer: number; mage: number; }

export interface ClassProgress { level: number; xp: number; xpNext: number; maxHp: number; }

export interface PlayerState {
  level: number; xp: number; xpNext: number;
  hp: number; maxHp: number;
  gold: number;
  cls: ClassId;
  // Per-class independent progression. Each class levels on its own XP pool
  // and keeps its own maxHp. The top-level level/xp/xpNext/maxHp mirror the
  // currently active class for backwards compatibility with the rest of the
  // engine and UI code.
  classLevels: Record<ClassId, ClassProgress>;
  skills: Skills;
  skillXp: SkillXp;
  skillXpNext: SkillXp;
  tan: number;
  tanXp: number;
  buffAtkUntil: number;
  cooldowns: Record<string, number>;
  kills: number;
  biomesVisited: string[];
  abilitiesUsed: number;
  achievements: string[];
  // Ability progression: owned per class + 4-slot loadout per class.
  ownedAbilities: Record<ClassId, string[]>;
  abilityLoadout: Record<ClassId, (string | null)[]>;
  // Buffs/statuses used by new classes
  invisibleUntil: number;
  boneShieldUntil: number;
  holyShieldUntil: number;
  frostArmorUntil: number;
  berserkUntil: number;
  poisonBladeUntil: number;
  consecrateUntil: number;
  nextAttackCrit: boolean;
  // New buffs for the extra abilities
  bloodlustUntil: number;
  warBannerUntil: number;
  manaShieldUntil: number;
  arcaneOrbUntil: number;
  deathMarkTargetUid: number;
  deathMarkUntil: number;
  // ---- Equipment system ----
  equipped: Partial<Record<EquipSlot, EquipItem>>;
  inventory: EquipItem[];
  gems: Record<Gem, number>;
}

export interface UiState {
  player: PlayerState;
  log: string[];
  biome: string;
  location: string;
  mapId: string;
  playerTx: number;
  playerTy: number;
  now: number;
  abilities: (AbilityDef | null)[]; // 4 loadout slots, null = empty
  abilityPool: AbilityDef[];        // all 6 abilities of current class
  ownedAbilityIds: string[];        // owned ids for current class
}

interface Entity {
  kind: "player" | "monster";
  tx: number; ty: number;
  px: number; py: number;
  fromX: number; fromY: number; toX: number; toY: number;
  stepStart: number; stepDur: number;
  dir: number; frame: number; frameTime: number;
  sprite: Sprite;
  hp: number; maxHp: number;
  hpBar?: Graphics;
  hpLabel?: Text;
  hitFlashUntil: number;
}
interface Monster extends Entity {
  kind: "monster";
  def: MonsterDef;
  level: number;
  damage: number;
  xp: number;
  spawnTx: number; spawnTy: number;
  nextThinkAt: number;
  lastAttackAt: number;
  dead: boolean;
  stunnedUntil: number;
  friendly?: boolean;      // true = minion (necromancer's skeleton)
  expiresAt?: number;      // minion expiry
  poisonedUntil?: number;  // DoT
  poisonTick?: number;
  poisonDmg?: number;
  burningUntil?: number;
  burnTick?: number;
  chilledUntil?: number;   // slowed
  plagueUntil?: number;
  plagueTick?: number;
}
interface Player extends Entity {
  kind: "player";
  lastAttackAt: number;
  state: PlayerState;
  classRing: Graphics;
}

interface Projectile {
  gfx: Graphics;
  fromX: number; fromY: number; toX: number; toY: number;
  start: number; dur: number;
  damage: number;
  targetId?: number;
  pierce?: boolean;
  hitIds?: Set<number>;
  onHit?: (m: Monster) => void;
  onArrive?: () => void;
  kind: "arrow" | "bolt" | "fire" | "meteor";
}
interface FxParticle {
  gfx: Graphics;
  born: number; life: number;
  vx: number; vy: number;
  gravity: number;
  alphaFrom: number;
  scaleFrom: number; scaleTo: number;
}
interface Trap {
  gfx: Graphics;
  tx: number; ty: number;
  damage: number;
  triggered: boolean;
  born: number;
  life: number;
}

export interface GameController {
  destroy(): void;
  setInput(dir: { x: number; y: number } | null): void;
  attack(): void;
  setClass(cls: ClassId): void;
  heal(): void;
  teleport(mapId: string): void;
  useAbility(index: 0 | 1 | 2 | 3): void;
  buyAbility(id: string): void;
  equipAbility(slotIndex: 0 | 1 | 2 | 3, abilityId: string | null): void;
  equipItem(uid: number): void;
  unequipItem(slot: EquipSlot): void;
  discardItem(uid: number): void;
  upgradeEquipped(slot: EquipSlot): { ok: boolean; msg: string };
  onUiChange(cb: (ui: UiState) => void): void;
  onForgeOpen(cb: () => void): void;
}

let MONSTER_UID = 1;

export async function startGame(parent: HTMLElement): Promise<GameController> {
  const app = new Application();
  await app.init({ background: "#0a0a0a", resizeTo: parent, antialias: false, roundPixels: true });
  parent.appendChild(app.canvas);

  // Biome tileset registry — url + slot for the loaded sheet.
  const biomeTilesetUrls: Record<string, string> = {
    meadow: tilesetMeadowUrl,
    mycelium: tilesetMyceliumUrl,
    clockwork: tilesetClockworkUrl,
    abyss_sea: tilesetAbyssSeaUrl,
    emberlands: tilesetEmberlandsUrl,
    shardveil: tilesetShardveilUrl,
    forest: tilesetForestUrl,
    desert: tilesetDesertUrl,
    tundra: tilesetTundraUrl,
    volcano: tilesetVolcanoUrl,
    ruins: tilesetRuinsUrl,
    crystal: tilesetCrystalUrl,
    swamp: tilesetSwampUrl,
    jungle: tilesetJungleUrl,
    sky: tilesetSkyUrl,
    abyss: tilesetAbyssUrl,
    frostpeak: tilesetFrostpeakUrl,
    sunken_temple: tilesetSunkenTempleUrl,
    neon_wastes: tilesetNeonWastesUrl,
    bloodmoon: tilesetBloodmoonUrl,
    celestial: tilesetCelestialUrl,
    ashen: tilesetAshenUrl,
    gloomwood: tilesetGloomwoodUrl,
    mire: tilesetMireUrl,
    runes: tilesetRunesUrl,
    void_gate: tilesetVoidGateUrl,
    // Main city + 10 new biomes. Each biome now uses its own dedicated tileset.
    main_city: tilesetMainCityUrl,
    crimson_dunes: tilesetCrimsonDunesUrl,
    obsidian_reef: tilesetObsidianReefUrl,
    seraph_grove: tilesetSeraphGroveUrl,
    thunderveil: tilesetThunderveilUrl,
    glass_desert: tilesetGlassDesertUrl,
    mirror_lake: tilesetMirrorLakeUrl,
    plasma_bog: tilesetPlasmaBogUrl,
    honeycomb_hive: tilesetHoneycombUrl,
    cursed_orchard: tilesetCursedOrchardUrl,
    cosmic_bazaar: tilesetCosmicBazaarUrl,
    // 10 new endgame biomes (Lv 75+)
    sunspire: tilesetSunspireUrl,
    moonshade: tilesetMoonshadeUrl,
    stormforge: tilesetStormforgeUrl,
    dreamweave: tilesetDreamweaveUrl,
    bone_wastes: tilesetBoneWastesUrl,
    venom_grove: tilesetVenomGroveUrl,
    magma_core: tilesetMagmaCoreUrl,
    astral_void: tilesetAstralVoidUrl,
    nightmare_gate: tilesetNightmareGateUrl,
    titan_ruins: tilesetTitanRuinsUrl,
  };
  const biomeIdList = Object.keys(biomeTilesetUrls);
  const [
    tileset,
    heroMeleeSheet, heroMageSheet, heroArcherSheet,
    heroPaladinSheet, heroAssassinSheet, heroBerserkerSheet,
    heroElementalistSheet, heroNecromancerSheet,
    slimeSheet, goblinSheet,
    crimsonWyrmSheet, bankerSheet, dummySheet, blacksmithSheet,
    abyssSlimeSheet, bogToadSheet, boneKnightSheet, cinderFiendSheet,
    cogSentinelSheet, jungleSerpentSheet, lanternMawSheet, marshWitchSheet,
    shadowHoundSheet, shardWidowSheet, skySpriteSheet, sporeWalkerSheet,
    stormEagleSheet, vineBeastSheet, voidStalkerSheet,
    ...biomeSheetsArr
  ] = await Promise.all([
    loadTileset(tilesetUrl),
    loadSheet(heroWarriorUrl, 4, 4),
    loadSheet(heroMageUrl, 4, 4),
    loadSheet(heroArcherUrl, 4, 4),
    loadSheet(heroPaladinUrl, 4, 4),
    loadSheet(heroAssassinUrl, 4, 4),
    loadSheet(heroBerserkerUrl, 4, 4),
    loadSheet(heroElementalistUrl, 4, 4),
    loadSheet(heroNecromancerUrl, 4, 4),
    loadSheet(slimeUrl, 4, 4),
    loadSheet(goblinUrl, 4, 4),
    loadSheet(enemyCrimsonWyrmUrl, 4, 4),
    loadSheet(npcBankerUrl, 4, 4),
    loadSheet(npcDummyUrl, 4, 4),
    loadSheet(npcBlacksmithUrl, 4, 4),
    loadSheet(enemyAbyssSlimeUrl, 4, 4),
    loadSheet(enemyBogToadUrl, 4, 4),
    loadSheet(enemyBoneKnightUrl, 4, 4),
    loadSheet(enemyCinderFiendUrl, 4, 4),
    loadSheet(enemyCogSentinelUrl, 4, 4),
    loadSheet(enemyJungleSerpentUrl, 4, 4),
    loadSheet(enemyLanternMawUrl, 4, 4),
    loadSheet(enemyMarshWitchUrl, 4, 4),
    loadSheet(enemyShadowHoundUrl, 4, 4),
    loadSheet(enemyShardWidowUrl, 4, 4),
    loadSheet(enemySkySpriteUrl, 4, 4),
    loadSheet(enemySporeWalkerUrl, 4, 4),
    loadSheet(enemyStormEagleUrl, 4, 4),
    loadSheet(enemyVineBeastUrl, 4, 4),
    loadSheet(enemyVoidStalkerUrl, 4, 4),
    ...biomeIdList.map((id) => loadTileset(biomeTilesetUrls[id])),
  ]);

  // Map a monster def's `sprite` field to the actual loaded sheet.
  // NPC IDs and skeleton minion are handled by exact id first (they share
  // the "goblin" sprite value but need different sheets). Then we look up
  // by sprite key. Fallback is goblin so any misconfig is visible but safe.
  const spriteSheets: Record<string, LoadedSheet> = {
    slime: slimeSheet,
    goblin: goblinSheet,
    crimson_wyrm: crimsonWyrmSheet,
    abyss_slime: abyssSlimeSheet,
    bog_toad: bogToadSheet,
    bone_knight: boneKnightSheet,
    cinder_fiend: cinderFiendSheet,
    cog_sentinel: cogSentinelSheet,
    jungle_serpent: jungleSerpentSheet,
    lantern_maw: lanternMawSheet,
    marsh_witch: marshWitchSheet,
    shadow_hound: shadowHoundSheet,
    shard_widow: shardWidowSheet,
    sky_sprite: skySpriteSheet,
    spore_walker: sporeWalkerSheet,
    storm_eagle: stormEagleSheet,
    vine_beast: vineBeastSheet,
    void_stalker: voidStalkerSheet,
  };
  function sheetForMonster(def: MonsterDef): LoadedSheet {
    if (def.id === "training_dummy") return dummySheet;
    if (def.id === "bank_npc") return bankerSheet;
    if (def.id === "blacksmith_npc") return blacksmithSheet;
    if (def.id === "skeleton_minion") return goblinSheet;
    return spriteSheets[def.sprite] ?? goblinSheet;
  }

  const classSheets: Record<ClassId, LoadedSheet> = {
    melee: heroMeleeSheet,
    archer: heroArcherSheet,
    mage: heroMageSheet,
    paladin: heroPaladinSheet,
    assassin: heroAssassinSheet,
    berserker: heroBerserkerSheet,
    elementalist: heroElementalistSheet,
    necromancer: heroNecromancerSheet,
  };
  function sheetForClass(cls: ClassId): LoadedSheet {
    return classSheets[cls];
  }
  const biomeTilesets: Record<string, LoadedSheet> = {};
  biomeIdList.forEach((id, i) => { biomeTilesets[id] = biomeSheetsArr[i]; });


  const world = new Container();
  world.scale.set(RENDER_SCALE);
  app.stage.addChild(world);

  const tileLayer = new Container();
  const entityLayer = new Container();
  const fxLayer = new Container();
  const overlayLayer = new Container();
  world.addChild(tileLayer, entityLayer, fxLayer, overlayLayer);

  // ---- Biome filters DISABLED per user request (no color tinting per biome) ----
  // Filters left as no-op so callers keep working; visuals are pure tileset art.
  const _unusedNoise = new NoiseFilter({ noise: 0.02, seed: Math.random() }); void _unusedNoise;
  const _unusedBloom = new BlurFilter({ strength: 0.5, quality: 2 }); void _unusedBloom;
  tileLayer.filters = [];
  entityLayer.filters = [];

  function applyBiomeShader(_biomeId: string) {
    // no-op: filters removed
  }
  void ColorMatrixFilter;

  function buildTileTextures(sheet: LoadedSheet): Texture[] {
    const base = Texture.from(sheet.canvas);
    const out: Texture[] = [];
    for (let i = 0; i < 16; i++) {
      const col = i % 4, row = (i / 4) | 0;
      out.push(new Texture({
        source: base.source,
        frame: new Rectangle(col * sheet.frameW, row * sheet.frameH, sheet.frameW, sheet.frameH),
      }));
    }
    return out;
  }
  const tileTextures = buildTileTextures(tileset);
  const biomeTileTextures: Record<string, Texture[]> = {};
  for (const [id, sheet] of Object.entries(biomeTilesets)) {
    biomeTileTextures[id] = buildTileTextures(sheet);
  }
  function texForTile(biomeId: string, tileIdx: number): Texture {
    const set = biomeTileTextures[biomeId];
    return (set ?? tileTextures)[tileIdx];
  }

  // Cache frame textures per sheet — creating a new Texture every frame per
  // entity was allocating thousands of GC objects per second.
  const _frameCache = new WeakMap<LoadedSheet, Texture[]>();
  function frameTex(sheet: LoadedSheet, dir: number, frame: number): Texture {
    let cache = _frameCache.get(sheet);
    if (!cache) {
      const base = Texture.from(sheet.canvas);
      cache = [];
      for (let d = 0; d < sheet.rows; d++) {
        for (let f = 0; f < sheet.cols; f++) {
          cache.push(new Texture({
            source: base.source,
            frame: new Rectangle(f * sheet.frameW, d * sheet.frameH, sheet.frameW, sheet.frameH),
          }));
        }
      }
      _frameCache.set(sheet, cache);
    }
    return cache[dir * sheet.cols + frame];
  }
  function makeCharSprite(sheet: LoadedSheet, tint?: number): Sprite {
    const s = new Sprite(frameTex(sheet, DIR_DOWN, 0));
    s.width = TILE_SIZE; s.height = TILE_SIZE; s.anchor.set(0, 0);
    if (tint !== undefined) s.tint = tint;
    return s;
  }

  let map: WorldMap = loadMap("__overworld__");
  const monsters: Monster[] = [];
  const stairMarkers: Graphics[] = [];
  const projectiles: Projectile[] = [];
  const fxParticles: FxParticle[] = [];
  const traps: Trap[] = [];

  const classRing = new Graphics();
  overlayLayer.addChild(classRing);

  const playerSprite = makeCharSprite(sheetForClass("melee"));
  entityLayer.addChild(playerSprite);

  const classOverlay = new Graphics();
  entityLayer.addChild(classOverlay);

  // Aura for buffs (warcry etc)
  const auraGfx = new Graphics();
  fxLayer.addChild(auraGfx);

  const initSkills: Skills = { defense: 10, melee: 10, archer: 10, mage: 10 };
  const player: Player = {
    kind: "player",
    tx: map.spawnX, ty: map.spawnY,
    px: map.spawnX * TILE_SIZE, py: map.spawnY * TILE_SIZE,
    fromX: 0, fromY: 0, toX: map.spawnX * TILE_SIZE, toY: map.spawnY * TILE_SIZE,
    stepStart: 0, stepDur: 0,
    dir: DIR_DOWN, frame: 0, frameTime: 0,
    sprite: playerSprite,
    hp: 60, maxHp: 60,
    hitFlashUntil: 0,
    lastAttackAt: -9999,
    classRing,
    state: {
      level: 1, xp: 0, xpNext: xpForLevel(2),
      hp: 60, maxHp: 60, gold: 0,
      cls: "melee",
      classLevels: (Object.keys(CLASSES) as ClassId[]).reduce((acc, id) => {
        acc[id] = { level: 1, xp: 0, xpNext: xpForLevel(2), maxHp: 60 };
        return acc;
      }, {} as Record<ClassId, ClassProgress>),
      skills: { ...initSkills },
      skillXp: { defense: 0, melee: 0, archer: 0, mage: 0 },
      skillXpNext: {
        defense: skillXpForNext(11),
        melee: skillXpForNext(11),
        archer: skillXpForNext(11),
        mage: skillXpForNext(11),
      },
      tan: 0, tanXp: 0,
      buffAtkUntil: 0,
      cooldowns: {},
      kills: 0,
      biomesVisited: [],
      abilitiesUsed: 0,
      achievements: [],
      ownedAbilities: (Object.keys(CLASSES) as ClassId[]).reduce((acc, id) => {
        acc[id] = [ABILITIES[id][0].id]; // starter only
        return acc;
      }, {} as Record<ClassId, string[]>),
      abilityLoadout: (Object.keys(CLASSES) as ClassId[]).reduce((acc, id) => {
        acc[id] = [ABILITIES[id][0].id, null, null, null];
        return acc;
      }, {} as Record<ClassId, (string | null)[]>),
      invisibleUntil: 0,
      boneShieldUntil: 0,
      holyShieldUntil: 0,
      frostArmorUntil: 0,
      berserkUntil: 0,
      poisonBladeUntil: 0,
      consecrateUntil: 0,
      nextAttackCrit: false,
      bloodlustUntil: 0,
      warBannerUntil: 0,
      manaShieldUntil: 0,
      arcaneOrbUntil: 0,
      deathMarkTargetUid: -1,
      deathMarkUntil: 0,
      equipped: {},
      inventory: [],
      gems: { green: 0, blue: 0, purple: 0, yellow: 0 },
    },
  };

  // ------- FX helpers -------
  function makeParticle(x: number, y: number, color: number, opts: Partial<FxParticle> = {}) {
    const g = new Graphics();
    g.circle(0, 0, 3).fill(color);
    g.x = x; g.y = y;
    fxLayer.addChild(g);
    const p: FxParticle = {
      gfx: g, born: performance.now(),
      life: opts.life ?? 500,
      vx: opts.vx ?? 0, vy: opts.vy ?? -30,
      gravity: opts.gravity ?? 40,
      alphaFrom: 1,
      scaleFrom: opts.scaleFrom ?? 1,
      scaleTo: opts.scaleTo ?? 0,
    };
    fxParticles.push(p);
    return p;
  }
  function fxHit(e: Entity) {
    e.hitFlashUntil = performance.now() + 180;
    for (let i = 0; i < 5; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 40;
      makeParticle(e.px + TILE_SIZE/2, e.py + TILE_SIZE/2, 0xfacc15, {
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 20,
        life: 400, gravity: 60,
      });
    }
  }
  function fxHeal(e: Entity) {
    for (let i = 0; i < 8; i++) {
      const ox = (Math.random() - 0.5) * TILE_SIZE * 0.8;
      makeParticle(e.px + TILE_SIZE/2 + ox, e.py + TILE_SIZE, 0x4ade80, {
        vx: (Math.random() - 0.5) * 20, vy: -50 - Math.random() * 30,
        gravity: -10, life: 700, scaleFrom: 1.4, scaleTo: 0,
      });
    }
  }
  function fxStep(e: Entity) {
    const g = new Graphics();
    g.ellipse(0, 0, 5, 2).fill({ color: 0xffffff, alpha: 0.35 });
    g.x = e.px + TILE_SIZE / 2;
    g.y = e.py + TILE_SIZE - 2;
    fxLayer.addChild(g);
    fxParticles.push({
      gfx: g, born: performance.now(), life: 300,
      vx: 0, vy: 0, gravity: 0, alphaFrom: 0.35,
      scaleFrom: 1, scaleTo: 1.6,
    });
  }
  function fxBurst(cx: number, cy: number, color: number, count = 20, spd = 100, life = 600) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const s = spd * (0.5 + Math.random() * 0.9);
      makeParticle(cx, cy, color, {
        vx: Math.cos(ang) * s, vy: Math.sin(ang) * s,
        life, gravity: 20, scaleFrom: 1.4, scaleTo: 0,
      });
    }
  }
  function fxRing(cx: number, cy: number, color: number, radius = TILE_SIZE * 2) {
    const g = new Graphics();
    g.circle(0, 0, 4).stroke({ color, width: 3, alpha: 0.9 });
    g.x = cx; g.y = cy;
    fxLayer.addChild(g);
    fxParticles.push({
      gfx: g, born: performance.now(), life: 500,
      vx: 0, vy: 0, gravity: 0, alphaFrom: 0.9,
      scaleFrom: 1, scaleTo: radius / 2,
    });
  }

  // Draw a class-specific weapon graphic on the class overlay
  function drawWeapon(g: Graphics, w: WeaponStyle, cx: number, cy: number, color: number) {
    switch (w) {
      case "sword":
        g.rect(cx + 6, cy - 10, 2, 16).fill(0xd1d5db);
        g.rect(cx + 4, cy + 5, 6, 2).fill(0x92400e);
        break;
      case "bow":
        g.moveTo(cx - 10, cy - 4).quadraticCurveTo(cx - 16, cy + 4, cx - 10, cy + 12).stroke({ color: 0x92400e, width: 2 });
        g.moveTo(cx - 10, cy - 4).lineTo(cx - 10, cy + 12).stroke({ color: 0xfef3c7, width: 1 });
        g.rect(cx + 5, cy - 2, 3, 10).fill(0x78350f);
        break;
      case "staff":
        g.rect(cx + 8, cy - 6, 2, 18).fill(0x78350f);
        g.circle(cx + 9, cy - 8, 3).fill(color);
        g.circle(cx + 9, cy - 8, 1.5).fill(0xffffff);
        break;
      case "hammer":
        g.rect(cx + 7, cy - 4, 2, 14).fill(0x78350f);
        g.rect(cx + 3, cy - 10, 10, 6).fill(0xe5e7eb).stroke({ color: 0xfde047, width: 1 });
        g.circle(cx + 8, cy - 7, 1.5).fill(0xfde047);
        break;
      case "daggers":
        g.rect(cx - 8, cy - 2, 1.5, 8).fill(0xd1d5db);
        g.rect(cx + 8, cy - 2, 1.5, 8).fill(0xd1d5db);
        g.rect(cx - 9, cy + 5, 3, 2).fill(0x991b1b);
        g.rect(cx + 7, cy + 5, 3, 2).fill(0x991b1b);
        break;
      case "axe":
        g.rect(cx + 6, cy - 8, 2, 18).fill(0x78350f);
        g.moveTo(cx + 6, cy - 8).lineTo(cx + 14, cy - 12).lineTo(cx + 14, cy).lineTo(cx + 6, cy - 4).closePath().fill(0xf1f5f9).stroke({ color: 0x475569, width: 1 });
        break;
      case "orb":
        g.rect(cx + 8, cy - 4, 2, 16).fill(0x475569);
        g.circle(cx + 9, cy - 6, 4).fill(color);
        g.circle(cx + 9, cy - 6, 2).fill(0xffffff);
        g.circle(cx + 9, cy - 6, 1).fill(color);
        break;
      case "scythe":
        g.rect(cx + 7, cy - 8, 2, 20).fill(0x1c1917);
        g.moveTo(cx + 8, cy - 8).quadraticCurveTo(cx + 20, cy - 12, cx + 18, cy).stroke({ color: 0xa855f7, width: 3 });
        g.moveTo(cx + 8, cy - 8).quadraticCurveTo(cx + 20, cy - 12, cx + 18, cy).stroke({ color: 0xf5f3ff, width: 1 });
        break;
    }
  }

  // Play a unique swing/burst FX for the class's basic attack
  function playAttackFx(target: { px: number; py: number } | null) {
    const cls = CLASSES[player.state.cls];
    const cx = player.px + TILE_SIZE / 2, cy = player.py + TILE_SIZE / 2;
    const tx = target ? target.px + TILE_SIZE / 2 : cx;
    const ty = target ? target.py + TILE_SIZE / 2 : cy;
    switch (cls.attackFx) {
      case "slash": {
        const g = new Graphics();
        g.arc(0, 0, 18, -0.8, 0.8).stroke({ color: 0xffffff, width: 4, alpha: 0.9 });
        g.x = tx; g.y = ty;
        fxLayer.addChild(g);
        fxParticles.push({ gfx: g, born: performance.now(), life: 200, vx: 0, vy: 0, gravity: 0, alphaFrom: 0.9, scaleFrom: 1, scaleTo: 1.6 });
        break;
      }
      case "hammerSmash": {
        fxRing(tx, ty, 0xfde047, TILE_SIZE * 1.6);
        fxBurst(tx, ty, 0xfef08a, 14, 90, 400);
        break;
      }
      case "daggerFlurry": {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const g = new Graphics();
            g.rect(-6, -1, 12, 2).fill(0xef4444);
            g.x = tx + (Math.random() - 0.5) * 8;
            g.y = ty + (Math.random() - 0.5) * 8;
            g.rotation = Math.random() * Math.PI;
            fxLayer.addChild(g);
            fxParticles.push({ gfx: g, born: performance.now(), life: 150, vx: 0, vy: 0, gravity: 0, alphaFrom: 0.9, scaleFrom: 1.2, scaleTo: 0.6 });
          }, i * 40);
        }
        break;
      }
      case "axeCleave": {
        const g = new Graphics();
        g.arc(0, 0, 22, -1.1, 1.1).stroke({ color: 0xdc2626, width: 6, alpha: 0.95 });
        g.x = tx; g.y = ty;
        fxLayer.addChild(g);
        fxParticles.push({ gfx: g, born: performance.now(), life: 260, vx: 0, vy: 0, gravity: 0, alphaFrom: 0.95, scaleFrom: 1, scaleTo: 1.8 });
        fxBurst(tx, ty, 0x991b1b, 10, 70, 300);
        break;
      }
      case "elementalBurst": {
        const colors = [0xef4444, 0x38bdf8, 0xfde047];
        const c = colors[Math.floor(Math.random() * colors.length)];
        fxBurst(tx, ty, c, 12, 90, 400);
        fxRing(tx, ty, c, TILE_SIZE);
        break;
      }
      case "soulReap": {
        // draw a curved sickle trail
        const g = new Graphics();
        g.arc(0, 0, 20, 0.3, 2.5).stroke({ color: 0xa855f7, width: 4, alpha: 0.9 });
        g.x = tx; g.y = ty;
        fxLayer.addChild(g);
        fxParticles.push({ gfx: g, born: performance.now(), life: 280, vx: 0, vy: 0, gravity: 0, alphaFrom: 0.9, scaleFrom: 1, scaleTo: 1.7 });
        // dark motes
        for (let i = 0; i < 6; i++) {
          const ang = Math.random() * Math.PI * 2;
          makeParticle(tx, ty, 0x581c87, { vx: Math.cos(ang) * 40, vy: Math.sin(ang) * 40 - 20, life: 500, gravity: 0, scaleFrom: 1.2, scaleTo: 0 });
        }
        break;
      }
      default: break;
    }
  }



  // ------- Monsters -------
  function overworldLevelFor(biomeId: string): number {
    const tier = BIOMES[biomeId]?.tier ?? 1;
    return Math.max(1, tier + ((Math.random() * 3) | 0) - 1);
  }
  function dungeonLevelFor(biomeId: string, floor: number): number {
    const tier = BIOMES[biomeId]?.tier ?? 1;
    return tier + (floor - 1) * 4 + ((Math.random() * 3) | 0);
  }

  function spawnMonster(defId: keyof typeof MONSTERS, tx: number, ty: number, level: number) {
    const def = MONSTERS[defId];
    const sheet = sheetForMonster(def);
    const sprite = makeCharSprite(sheet, def.tint);
    entityLayer.addChild(sprite);
    const scaled = scaleMonster(def, level);
    const m: Monster = {
      kind: "monster", def, level,
      damage: scaled.damage, xp: scaled.xp,
      tx, ty,
      px: tx * TILE_SIZE, py: ty * TILE_SIZE,
      fromX: tx * TILE_SIZE, fromY: ty * TILE_SIZE,
      toX: tx * TILE_SIZE, toY: ty * TILE_SIZE,
      stepStart: 0, stepDur: 0,
      dir: DIR_DOWN, frame: 0, frameTime: 0,
      sprite,
      hp: scaled.hp, maxHp: scaled.hp,
      hitFlashUntil: 0,
      spawnTx: tx, spawnTy: ty,
      nextThinkAt: 0, lastAttackAt: -9999,
      dead: false,
      stunnedUntil: 0,
    };
    monsters.push(m);
    (m as unknown as { __uid: number }).__uid = MONSTER_UID++;
  }

  function summonSkeleton() {
    // Skeleton has same HP as player, ~half damage. Aggros enemies via friendly=true.
    const def = MONSTERS["skeleton_minion"];
    if (!def) return;
    // Find an adjacent free tile
    const offsets = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    let sx = player.tx, sy = player.ty;
    for (const [dx, dy] of offsets) {
      const nx = player.tx + dx, ny = player.ty + dy;
      if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
      if (isBlocked(map, nx, ny)) continue;
      if (monsters.some(m => !m.dead && m.tx === nx && m.ty === ny)) continue;
      sx = nx; sy = ny; break;
    }
    const sheet = goblinSheet;
    const sprite = makeCharSprite(sheet, def.tint);
    entityLayer.addChild(sprite);
    const skDmg = Math.max(2, Math.floor(playerDamage() * 0.5));
    const m: Monster = {
      kind: "monster", def, level: player.state.level,
      damage: skDmg, xp: 0,
      tx: sx, ty: sy,
      px: sx * TILE_SIZE, py: sy * TILE_SIZE,
      fromX: sx * TILE_SIZE, fromY: sy * TILE_SIZE,
      toX: sx * TILE_SIZE, toY: sy * TILE_SIZE,
      stepStart: 0, stepDur: 0,
      dir: DIR_DOWN, frame: 0, frameTime: 0,
      sprite,
      hp: player.maxHp, maxHp: player.maxHp,
      hitFlashUntil: 0,
      spawnTx: sx, spawnTy: sy,
      nextThinkAt: 0, lastAttackAt: -9999,
      dead: false,
      stunnedUntil: 0,
      friendly: true,
      expiresAt: performance.now() + 20000,
    };
    monsters.push(m);
    (m as unknown as { __uid: number }).__uid = MONSTER_UID++;
    fxBurst(m.px + TILE_SIZE/2, m.py + TILE_SIZE/2, 0xf5f5f4, 20, 100, 500);
    fxRing(m.px + TILE_SIZE/2, m.py + TILE_SIZE/2, 0xa855f7, TILE_SIZE * 1.4);
    log("Um esqueleto emerge do solo para te servir!");
  }

  function pickSpawn(biomeId: string, rnd: () => number): keyof typeof MONSTERS | null {
    const spawns = BIOMES[biomeId]?.spawns ?? [];
    if (spawns.length === 0) return null; // safe zones (main_city)
    const total = spawns.reduce((s, x) => s + x.weight, 0);
    let r = rnd() * total;
    for (const s of spawns) { r -= s.weight; if (r <= 0) return s.monster; }
    return spawns[0].monster;
  }

  // Viewport-culled tile rendering with a persistent sprite pool.
  // Instead of destroy/create per window rebuild, we reuse Sprite instances
  // and only update `.texture` + `.x/.y`. Also the window is only rebuilt
  // when the player crosses half of the view radius.
  const TILE_VIEW_R = 24;
  const TILE_POOL_SIDE = TILE_VIEW_R * 2 + 1;
  const tilePool: Sprite[] = [];
  let tileWindow = { cx: -9999, cy: -9999 };

  function ensureTilePool() {
    const need = TILE_POOL_SIDE * TILE_POOL_SIDE;
    while (tilePool.length < need) {
      const s = new Sprite();
      s.width = TILE_SIZE; s.height = TILE_SIZE;
      s.visible = false;
      tileLayer.addChild(s);
      tilePool.push(s);
    }
  }

  function buildTileWindow(cx: number, cy: number) {
    ensureTilePool();
    const r = TILE_VIEW_R;
    const x0 = Math.max(0, cx - r), x1 = Math.min(map.w - 1, cx + r);
    const y0 = Math.max(0, cy - r), y1 = Math.min(map.h - 1, cy + r);
    let idx = 0;
    for (let y = y0; y <= y1; y++) {
      const row = y * map.w;
      for (let x = x0; x <= x1; x++) {
        const t = map.tiles[row + x];
        const biomeHere = map.biomeAt(x, y);
        const s = tilePool[idx++];
        s.texture = texForTile(biomeHere, t);
        s.x = x * TILE_SIZE; s.y = y * TILE_SIZE;
        s.visible = true;
      }
    }
    // Hide unused pool sprites (map edges yield fewer than pool size).
    for (let i = idx; i < tilePool.length; i++) tilePool[i].visible = false;
    tileWindow = { cx, cy };
  }
  function rebuildTiles() {
    const cx = (typeof player !== "undefined" && player) ? player.tx : map.spawnX;
    const cy = (typeof player !== "undefined" && player) ? player.ty : map.spawnY;
    buildTileWindow(cx, cy);
  }
  function updateTileWindow() {
    if (typeof player === "undefined" || !player) return;
    if (Math.abs(player.tx - tileWindow.cx) > TILE_VIEW_R / 2 ||
        Math.abs(player.ty - tileWindow.cy) > TILE_VIEW_R / 2) {
      buildTileWindow(player.tx, player.ty);
    }
  }
  function rebuildStairs() {
    for (const g of stairMarkers) { overlayLayer.removeChild(g); g.destroy(); }
    stairMarkers.length = 0;
    for (const s of map.stairs) {
      const g = new Graphics();
      const isDown = s.kind === "down";
      const c = isDown ? 0x60a5fa : 0xfbbf24;
      g.rect(0, 0, TILE_SIZE, TILE_SIZE).stroke({ color: c, width: 2 })
        .rect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12).fill({ color: c, alpha: 0.35 });
      g.x = s.tx * TILE_SIZE; g.y = s.ty * TILE_SIZE;
      overlayLayer.addChild(g);
      stairMarkers.push(g);
    }
  }
  function clearMonsters() {
    for (const m of monsters) {
      entityLayer.removeChild(m.sprite); m.sprite.destroy();
      if (m.hpBar) { overlayLayer.removeChild(m.hpBar); m.hpBar.destroy(); }
      if (m.hpLabel) { overlayLayer.removeChild(m.hpLabel); m.hpLabel.destroy(); }
    }
    monsters.length = 0;
  }
  function clearProjectiles() {
    for (const p of projectiles) { fxLayer.removeChild(p.gfx); p.gfx.destroy(); }
    projectiles.length = 0;
  }
  function clearTraps() {
    for (const t of traps) { fxLayer.removeChild(t.gfx); t.gfx.destroy(); }
    traps.length = 0;
  }

  function currentBiomeIdAtPlayer(): string {
    return map.biomeAt(player.tx, player.ty);
  }
  function currentLocation(): string {
    if (map.isDungeon) return `${BIOMES[map.dungeonBiome!].dungeonName} — Andar ${map.dungeonFloor}`;
    return BIOMES[currentBiomeIdAtPlayer()].name;
  }

  function loadMapById(id: string, arriveAt?: { x: number; y: number }) {
    map = loadMap(id);
    rebuildTiles();
    rebuildStairs();
    clearMonsters();
    clearProjectiles();
    clearTraps();

    let a = (id.length * 2654435761) ^ 0xABCDEF;
    const rnd = () => { a = (a * 1664525 + 1013904223) | 0; return ((a >>> 0) % 10000) / 10000; };

    if (map.isDungeon) {
      const b = map.dungeonBiome!;
      const floor = map.dungeonFloor!;
      // 3x more enemies per dungeon floor.
      const count = (12 + floor * 6) * 3;
      for (let i = 0; i < count; i++) {
        let tx = 0, ty = 0;
        for (let t = 0; t < 60; t++) {
          tx = 2 + ((rnd() * (map.w - 4)) | 0);
          ty = 2 + ((rnd() * (map.h - 4)) | 0);
          if (!isBlocked(map, tx, ty) &&
              Math.abs(tx - map.spawnX) + Math.abs(ty - map.spawnY) > 4 &&
              !map.stairs.some(s => Math.abs(s.tx - tx) + Math.abs(s.ty - ty) < 2)) break;
        }
        const spId = pickSpawn(b, rnd); if (spId) spawnMonster(spId, tx, ty, dungeonLevelFor(b, floor));
      }
    } else {
      // 3x more enemies per biome (world is bigger so density stays sane).
      const total = 130 * 3;
      for (let i = 0; i < total; i++) {
        let tx = 0, ty = 0;
        for (let t = 0; t < 60; t++) {
          tx = 2 + ((rnd() * (map.w - 4)) | 0);
          ty = 2 + ((rnd() * (map.h - 4)) | 0);
          if (!isBlocked(map, tx, ty) &&
              Math.abs(tx - map.spawnX) + Math.abs(ty - map.spawnY) > 8 &&
              !map.stairs.some(s => Math.abs(s.tx - tx) + Math.abs(s.ty - ty) < 3)) break;
        }
        const b = map.biomeAt(tx, ty);
        const spId = pickSpawn(b, rnd); if (spId) spawnMonster(spId, tx, ty, overworldLevelFor(b));
    }

    // Spawn city NPCs (bank + training dummy + blacksmith) as static monsters.
    for (const npc of map.npcs) {
      if (isBlocked(map, npc.tx, npc.ty)) continue;
      const monsterId =
        npc.kind === "bank" ? "bank_npc" :
        npc.kind === "blacksmith" ? "blacksmith_npc" :
        "training_dummy";
      spawnMonster(monsterId, npc.tx, npc.ty, 1);
    }
    }

    // FIX: teleport-into-wall bug. Snap arrive point to nearest walkable tile.
    const wanted = arriveAt ?? { x: map.spawnX, y: map.spawnY };
    const safe = nearestWalkable(map, wanted.x, wanted.y);
    player.tx = safe.x; player.ty = safe.y;
    player.px = player.fromX = player.toX = safe.x * TILE_SIZE;
    player.py = player.fromY = player.toY = safe.y * TILE_SIZE;
    player.stepStart = 0; player.stepDur = 0;

    // Biome visit tracking + shader.
    const bId = currentBiomeIdAtPlayer();
    applyBiomeShader(bId);
    if (!player.state.biomesVisited.includes(bId)) {
      player.state.biomesVisited.push(bId);
    }
    log(`Entrou em ${currentLocation()}.`);
    checkAchievements();
    notifyUi();
  }

  // ---- HP bar + level label ----
  function ensureHpBar(e: Entity) {
    if (!e.hpBar) { const g = new Graphics(); overlayLayer.addChild(g); e.hpBar = g; }
    return e.hpBar;
  }
  function drawHpBar(e: Entity) {
    const g = ensureHpBar(e);
    g.clear();
    const w = TILE_SIZE - 4, h = 3;
    const x = e.px + 2, y = e.py - 5;
    g.rect(x, y, w, h).fill(0x000000);
    const ratio = Math.max(0, e.hp / e.maxHp);
    g.rect(x, y, w * ratio, h).fill(e.kind === "player" ? 0x4ade80 : 0xef4444);
    if (e.kind === "monster") {
      const m = e as Monster;
      if (!m.hpLabel) {
        m.hpLabel = new Text({
          text: `Lv ${m.level}`,
          style: { fill: 0xfef08a, fontFamily: "monospace", fontSize: 8, fontWeight: "bold",
                   stroke: { color: 0x000000, width: 2 } },
        });
        overlayLayer.addChild(m.hpLabel);
      }
      m.hpLabel.text = `Lv ${m.level}`;
      m.hpLabel.x = e.px + TILE_SIZE / 2 - m.hpLabel.width / 2;
      m.hpLabel.y = y - 10;
    }
  }

  const floaters: { text: Text; life: number; vy: number }[] = [];
  function floatText(x: number, y: number, txt: string, color: number) {
    const t = new Text({ text: txt, style: {
      fill: color, fontFamily: "monospace", fontSize: 10, fontWeight: "bold",
      stroke: { color: 0x000000, width: 2 },
    }});
    t.x = x + 6; t.y = y - 4;
    overlayLayer.addChild(t);
    floaters.push({ text: t, life: 700, vy: -0.025 });
  }

  function abilityById(cls: ClassId, id: string | null): AbilityDef | null {
    if (!id) return null;
    return ABILITIES[cls].find(a => a.id === id) ?? null;
  }

  const uiState: UiState = {
    player: player.state,
    log: ["Bem-vindo a Rimhold."],
    biome: BIOMES[currentBiomeIdAtPlayer()].name,
    location: currentLocation(),
    mapId: map.id,
    playerTx: player.tx,
    playerTy: player.ty,
    now: performance.now(),
    abilities: player.state.abilityLoadout[player.state.cls].map(id => abilityById(player.state.cls, id)),
    abilityPool: ABILITIES[player.state.cls],
    ownedAbilityIds: [...player.state.ownedAbilities[player.state.cls]],
  };
  const uiSubs: ((ui: UiState) => void)[] = [];
  const forgeOpenSubs: (() => void)[] = [];
  const snapshot = (): UiState => ({
    player: { ...player.state,
      skills: { ...player.state.skills },
      skillXp: { ...player.state.skillXp },
      skillXpNext: { ...player.state.skillXpNext },
      cooldowns: { ...player.state.cooldowns },
      biomesVisited: [...player.state.biomesVisited],
      achievements: [...player.state.achievements],
      ownedAbilities: { ...player.state.ownedAbilities },
      abilityLoadout: { ...player.state.abilityLoadout },
      equipped: { ...player.state.equipped },
      inventory: [...player.state.inventory],
      gems: { ...player.state.gems },
    },
    log: uiState.log.slice(-6),
    biome: BIOMES[currentBiomeIdAtPlayer()].name,
    location: currentLocation(),
    mapId: map.id,
    playerTx: player.tx,
    playerTy: player.ty,
    now: performance.now(),
    abilities: player.state.abilityLoadout[player.state.cls].map(id => abilityById(player.state.cls, id)),
    abilityPool: ABILITIES[player.state.cls],
    ownedAbilityIds: [...player.state.ownedAbilities[player.state.cls]],
  });
  const notifyUi = () => { const s = snapshot(); for (const cb of uiSubs) cb(s); };
  const log = (msg: string) => {
    uiState.log.push(msg);
    if (uiState.log.length > 30) uiState.log.shift();
    notifyUi();
  };

  loadMapById("__overworld__");

  function gainSkillXp(skill: SkillId, amount: number) {
    player.state.skillXp[skill] += amount;
    while (player.state.skillXp[skill] >= player.state.skillXpNext[skill]) {
      player.state.skillXp[skill] -= player.state.skillXpNext[skill];
      player.state.skills[skill] += 1;
      player.state.skillXpNext[skill] = skillXpForNext(player.state.skills[skill] + 1);
      log(`${skillName(skill)} subiu para ${player.state.skills[skill]}!`);
    }
  }
  function gainXp(amount: number) {
    player.state.xp += amount;
    while (player.state.xp >= player.state.xpNext) {
      player.state.xp -= player.state.xpNext;
      player.state.level += 1;
      player.state.maxHp += 10;
      player.state.hp = player.state.maxHp;
      player.hp = player.maxHp = player.state.maxHp;
      player.state.xpNext = xpForLevel(player.state.level + 1);
      log(`Nível ${player.state.level}!`);
    }
  }
  function skillName(s: SkillId): string {
    return s === "defense" ? "Defesa" : s === "melee" ? "Ataque" : s === "archer" ? "Arqueiro" : "Magia";
  }

  // ---- Achievements ----
  function checkAchievements() {
    for (const a of ACHIEVEMENTS) {
      if (player.state.achievements.includes(a.id)) continue;
      let v = 0;
      switch (a.metric) {
        case "kills":          v = player.state.kills; break;
        case "biomesVisited":  v = player.state.biomesVisited.length; break;
        case "level":          v = player.state.level; break;
        case "gold":           v = player.state.gold; break;
        case "abilitiesUsed":  v = player.state.abilitiesUsed; break;
        case "tan":            v = player.state.tan; break;
      }
      if (v >= a.target) {
        player.state.achievements.push(a.id);
        player.state.gold += a.reward;
        log(`🏆 Conquista: ${a.name}! +${a.reward}g`);
      }
    }
  }

  function playerDamage(): number {
    const cls = CLASSES[player.state.cls];
    const skill = player.state.skills[cls.primarySkill];
    let dmg = cls.baseDamage + Math.floor(skill * 0.55) + Math.floor(player.state.level * 0.5);
    // Equipment flat damage bonus (small).
    dmg += equipmentBonuses(player.state.equipped).dmg;
    const now = performance.now();
    if (now < player.state.buffAtkUntil) dmg = Math.floor(dmg * 1.5);
    if (now < player.state.berserkUntil) dmg = Math.floor(dmg * 1.7);
    if (player.state.nextAttackCrit) { dmg = Math.floor(dmg * 2.2); player.state.nextAttackCrit = false; }
    return dmg;
  }
  function playerDefenseMitigation(rawDmg: number): number {
    const now = performance.now();
    if (now < player.state.holyShieldUntil) return Math.max(0, Math.floor(rawDmg * 0.4));
    if (now < player.state.frostArmorUntil) rawDmg = Math.floor(rawDmg * 0.7);
    if (now < player.state.boneShieldUntil) rawDmg = Math.floor(rawDmg * 0.75);
    const d = player.state.skills.defense + equipmentBonuses(player.state.equipped).def;
    return Math.max(1, rawDmg - Math.floor(d * 0.18));
  }

  // Recompute maxHp from current class base + equipment bonuses.
  // Called on equip/unequip and after any inventory change that could
  // affect stats. Keeps ratio of hp/maxHp so player isn't over-healed.
  function recomputeMaxHp() {
    const cls = player.state.cls;
    const base = player.state.classLevels[cls].maxHp;
    const bonus = equipmentBonuses(player.state.equipped).hp;
    const target = base + bonus;
    const ratio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    player.maxHp = target;
    player.state.maxHp = target;
    player.hp = Math.min(target, Math.max(1, Math.round(target * ratio)));
    player.state.hp = player.hp;
  }

  function equipItem(uid: number) {
    const idx = player.state.inventory.findIndex(i => i.uid === uid);
    if (idx < 0) return;
    const item = player.state.inventory[idx];
    const cur = player.state.equipped[item.slot];
    if (cur) player.state.inventory.push(cur);
    player.state.equipped[item.slot] = item;
    player.state.inventory.splice(idx, 1);
    recomputeMaxHp();
    notifyUi();
  }
  function unequipItem(slot: EquipSlot) {
    const cur = player.state.equipped[slot];
    if (!cur) return;
    player.state.inventory.push(cur);
    delete player.state.equipped[slot];
    recomputeMaxHp();
    notifyUi();
  }
  function discardItem(uid: number) {
    const idx = player.state.inventory.findIndex(i => i.uid === uid);
    if (idx < 0) return;
    player.state.inventory.splice(idx, 1);
    notifyUi();
  }
  function upgradeEquipped(slot: EquipSlot): { ok: boolean; msg: string } {
    const it = player.state.equipped[slot];
    if (!it) return { ok: false, msg: "Nada equipado neste slot." };
    if (it.rarity >= 4) return { ok: false, msg: "Já está no nível máximo (Lendário)." };
    const gem = gemForUpgrade(it.rarity);
    if (!gem) return { ok: false, msg: "Não é possível melhorar." };
    if ((player.state.gems[gem] ?? 0) < GEMS_PER_UPGRADE) {
      return { ok: false, msg: `Precisa de ${GEMS_PER_UPGRADE} ${gem === "green" ? "jóias verdes" : gem === "blue" ? "jóias azuis" : gem === "purple" ? "jóias roxas" : "jóias amarelas"}.` };
    }
    player.state.gems[gem] -= GEMS_PER_UPGRADE;
    it.rarity = (it.rarity + 1) as Rarity;
    recomputeMaxHp();
    log(`🔨 Ferreiro: melhorou ${slot} para raridade ${it.rarity}!`);
    notifyUi();
    return { ok: true, msg: "Melhorado!" };
  }

  function setClass(cls: ClassId) {
    if (player.state.cls === cls) return;
    // Save current class progression, then load target class progression.
    const s = player.state;
    s.classLevels[s.cls] = { level: s.level, xp: s.xp, xpNext: s.xpNext, maxHp: s.maxHp };
    const next = s.classLevels[cls] ?? { level: 1, xp: 0, xpNext: xpForLevel(2), maxHp: 60 };
    s.cls = cls;
    s.level = next.level;
    s.xp = next.xp;
    s.xpNext = next.xpNext;
    s.maxHp = next.maxHp;
    // Refill HP on class swap to the new class's own maxHp (feels good and
    // prevents crashes when swapping to a class with a smaller pool).
    s.hp = next.maxHp;
    player.hp = player.maxHp = next.maxHp;
    log(`Classe: ${CLASSES[cls].name} (Lv ${next.level}).`);
    notifyUi();
  }

  let wantAttack = false;
  function tryAttack(now: number) {
    const cls = CLASSES[player.state.cls];
    if (now - player.lastAttackAt < cls.cooldownMs) return;
    if (cls.attackKind === "melee") {
      const f = facingTile(player);
      const target = monsters.find(m => !m.dead && !m.friendly && m.tx === f.x && m.ty === f.y);
      if (!target) return;
      player.lastAttackAt = now;
      const dmg = playerDamage();
      applyDamageToMonster(target, dmg);
      // Poison blade DoT
      if (now < player.state.poisonBladeUntil) applyPoison(target, Math.max(2, Math.floor(dmg * 0.35)));
      // Assassin daggers: second hit
      if (player.state.cls === "assassin") {
        setTimeout(() => { if (!target.dead) applyDamageToMonster(target, Math.max(1, Math.floor(dmg * 0.55))); }, 80);
      }
      // Berserker cleave: hit adjacent enemies too for reduced damage
      if (player.state.cls === "berserker") {
        for (const m of monsters) {
          if (m === target || m.dead || m.friendly) continue;
          if (Math.abs(m.tx - f.x) + Math.abs(m.ty - f.y) <= 1) applyDamageToMonster(m, Math.floor(dmg * 0.6));
        }
      }
      // Assassin: dropping invisibility on attack
      if (player.state.cls === "assassin") player.state.invisibleUntil = 0;
      playAttackFx(target);
      gainSkillXp("melee", SKILL_XP_PER_HIT);
    } else {
      const target = findRangedTarget(cls.attackRange);
      if (!target) return;
      player.lastAttackAt = now;
      const dmg = playerDamage();
      spawnProjectileTargeted(target, cls.attackKind === "arrow" ? "arrow" : "bolt", dmg);
      playAttackFx(target);
      gainSkillXp(cls.attackKind === "arrow" ? "archer" : "mage", SKILL_XP_PER_HIT);
    }
  }

  function applyPoison(m: Monster, dmg: number) {
    const now = performance.now();
    m.poisonedUntil = now + 4000;
    m.poisonDmg = dmg;
    m.poisonTick = now + 500;
  }

  function findRangedTarget(range: number): Monster | null {
    let best: Monster | null = null;
    let bestD = Infinity;
    for (const m of monsters) {
      if (m.dead || m.friendly) continue;
      const d = Math.abs(m.tx - player.tx) + Math.abs(m.ty - player.ty);
      if (d > range) continue;
      if (d < bestD) { bestD = d; best = m; }
    }
    return best;
  }

  function spawnProjectileTargeted(target: Monster, kind: "arrow" | "bolt", damage: number) {
    const uid = (target as unknown as { __uid: number }).__uid;
    const g = new Graphics();
    if (kind === "arrow") {
      g.rect(-6, -1, 12, 2).fill(0xfef3c7).rect(-8, -2, 2, 4).fill(0x92400e);
    } else {
      g.circle(0, 0, 4).fill(0x8b5cf6).circle(0, 0, 2).fill(0xf0abfc);
    }
    fxLayer.addChild(g);
    const from = { x: player.px + TILE_SIZE/2, y: player.py + TILE_SIZE/2 };
    const to   = { x: target.px + TILE_SIZE/2, y: target.py + TILE_SIZE/2 };
    projectiles.push({
      gfx: g, kind,
      fromX: from.x, fromY: from.y, toX: to.x, toY: to.y,
      start: performance.now(),
      dur: Math.max(180, Math.hypot(to.x - from.x, to.y - from.y) * 3),
      damage, targetId: uid,
      onHit: (m) => applyDamageToMonster(m, damage),
    });
  }

  // Direction-based projectile (for abilities that shoot in facing dir).
  function spawnDirProjectile(dxT: number, dyT: number, tiles: number, damage: number,
                              kind: "arrow" | "bolt" | "fire", opts: { pierce?: boolean; onArrive?: () => void } = {}) {
    const g = new Graphics();
    if (kind === "arrow") {
      g.rect(-8, -1, 16, 3).fill(0xfef3c7).rect(-10, -3, 2, 6).fill(0x92400e);
    } else if (kind === "fire") {
      g.circle(0, 0, 7).fill(0xdc2626).circle(0, 0, 4).fill(0xfacc15).circle(0, 0, 1.5).fill(0xffffff);
    } else {
      g.circle(0, 0, 5).fill(0x8b5cf6).circle(0, 0, 2).fill(0xf0abfc);
    }
    fxLayer.addChild(g);
    const fromX = player.px + TILE_SIZE/2, fromY = player.py + TILE_SIZE/2;
    const toX = fromX + dxT * tiles * TILE_SIZE;
    const toY = fromY + dyT * tiles * TILE_SIZE;
    projectiles.push({
      gfx: g, kind,
      fromX, fromY, toX, toY,
      start: performance.now(),
      dur: Math.max(200, Math.hypot(toX - fromX, toY - fromY) * 2.5),
      damage,
      pierce: opts.pierce, hitIds: opts.pierce ? new Set<number>() : undefined,
      onArrive: opts.onArrive,
    });
  }

  function applyDamageToMonster(m: Monster, dmg: number) {
    if (m.dead) return;
    // Bank NPC is invulnerable; interacting = message.
    if (m.def.id === "bank_npc") {
      floatText(m.px, m.py, "Banco 💰", 0xfbbf24);
      log("Banco de Rimhold: seu ouro está seguro aqui.");
      return;
    }
    if (m.def.id === "blacksmith_npc") {
      floatText(m.px, m.py, "Ferreiro 🔨", 0xf59e0b);
      log("Ferreiro: abra o Equipamento (E) e clique 'Ferreiro' para melhorar.");
      forgeOpenSubs.forEach((cb) => cb());
      return;
    }
    // Training dummy: grants small XP per hit, never dies.
    if (m.def.id === "training_dummy") {
      const xp = 3;
      gainXp(xp);
      fxHit(m);
      floatText(m.px, m.py, "+" + xp + " xp", 0x86efac);
      m.hp = m.maxHp;
      return;
    }
    m.hp -= dmg;
    fxHit(m);
    floatText(m.px, m.py, String(dmg), 0xfef08a);
    if (m.hp <= 0) {
      m.dead = true;
      m.sprite.visible = false;
      if (m.hpBar) m.hpBar.visible = false;
      if (m.hpLabel) m.hpLabel.visible = false;
      if (m.friendly) {
        // minion perishes silently
        fxBurst(m.px + TILE_SIZE/2, m.py + TILE_SIZE/2, 0xd6d3d1, 12, 60, 400);
        setTimeout(() => {
          if (m.sprite.destroyed) return;
          m.sprite.destroy();
          if (m.hpBar) m.hpBar.destroy();
          if (m.hpLabel) m.hpLabel.destroy();
          const idx = monsters.indexOf(m);
          if (idx >= 0) monsters.splice(idx, 1);
        }, 100);
      } else {
        const gold = 1 + Math.floor(m.xp / 5);
        player.state.gold += gold;
        player.state.kills += 1;
        gainXp(m.xp);
        // Equipment drop (1% chance).
        if (Math.random() < EQUIP_DROP_CHANCE) {
          const biomeId = map.biomeAt(m.tx, m.ty);
          const item = makeDropItem(biomeId, m.level);
          player.state.inventory.push(item);
          floatText(m.px, m.py - 10, "★ Equipamento!", 0xfbbf24);
          log(`Drop! Equipamento (${item.slot}) — abra o menu Equipamento (E).`);
        }
        // Gem drops (independent rolls).
        for (const g of GEMS) {
          if (Math.random() < GEM_DROP[g]) {
            player.state.gems[g] = (player.state.gems[g] ?? 0) + 1;
            const colorMap: Record<Gem, number> = {
              green: 0x22c55e, blue: 0x3b82f6, purple: 0xa855f7, yellow: 0xfacc15,
            };
            floatText(m.px + (Math.random()*20-10), m.py - 6, "◆ jóia", colorMap[g]);
          }
        }
        log(`${m.def.name} (Lv ${m.level}) caiu +${m.xp} xp +${gold}g.`);
        checkAchievements();
        setTimeout(() => {
          if (m.sprite.destroyed) return;
          m.hp = m.maxHp;
          m.tx = m.spawnTx; m.ty = m.spawnTy;
          m.px = m.tx * TILE_SIZE; m.py = m.ty * TILE_SIZE;
          m.toX = m.px; m.toY = m.py;
          m.dead = false;
          m.sprite.visible = true;
          if (m.hpBar) m.hpBar.visible = true;
          if (m.hpLabel) m.hpLabel.visible = true;
        }, 7000);
      }
    }
    notifyUi();
  }

  const HEAL_COOLDOWN = 4000;
  let lastHealAt = -9999;
  function tryHeal(now: number) {
    if (now - lastHealAt < HEAL_COOLDOWN) return;
    if (player.state.gold < 3) { log("Sem ouro para poção (3g)."); return; }
    const amount = 20 + player.state.skills.defense;
    player.hp = Math.min(player.maxHp, player.hp + amount);
    player.state.hp = player.hp;
    player.state.gold -= 3;
    lastHealAt = now;
    fxHeal(player);
    floatText(player.px, player.py, "+" + amount, 0x86efac);
    gainSkillXp("defense", SKILL_XP_PER_HIT);
    notifyUi();
  }

  // ---- Abilities ----
  function facingVec(): { x: number; y: number } {
    switch (player.dir) {
      case DIR_LEFT:  return { x: -1, y: 0 };
      case DIR_RIGHT: return { x: 1,  y: 0 };
      case DIR_UP:    return { x: 0,  y: -1 };
      default:        return { x: 0,  y: 1 };
    }
  }
  function useAbility(index: 0 | 1 | 2 | 3) {
    const cls = player.state.cls;
    const slotId = player.state.abilityLoadout[cls][index];
    if (!slotId) { floatText(player.px, player.py, "Vazio", 0x94a3b8); return; }
    const ab = ABILITIES[cls].find(a => a.id === slotId);
    if (!ab) return;
    const now = performance.now();
    const ready = player.state.cooldowns[ab.id] ?? 0;
    if (now < ready) { floatText(player.px, player.py, "CD", 0xf87171); return; }
    player.state.cooldowns[ab.id] = now + ab.cooldownMs;
    player.state.abilitiesUsed += 1;
    const dmg = playerDamage();

    switch (ab.kind) {
      case "whirlwind": {
        fxRing(player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, ab.color, TILE_SIZE * 2);
        fxBurst(player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, ab.color, 30, 140);
        for (const m of monsters) if (!m.dead && Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 1) applyDamageToMonster(m, Math.floor(dmg * 1.2));
        break;
      }
      case "charge": {
        const v = facingVec();
        let steps = 0;
        for (let i = 1; i <= 4; i++) {
          const nx = player.tx + v.x * i, ny = player.ty + v.y * i;
          if (isBlocked(map, nx, ny)) break;
          steps = i;
        }
        if (steps > 0) {
          player.tx += v.x * steps; player.ty += v.y * steps;
          player.px = player.toX = player.tx * TILE_SIZE;
          player.py = player.toY = player.ty * TILE_SIZE;
          // Push monsters at destination
          for (const m of monsters) if (!m.dead && Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 1) applyDamageToMonster(m, Math.floor(dmg * 1.4));
          fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, 25, 160);
        }
        break;
      }
      case "warcry": {
        player.state.buffAtkUntil = now + 8000;
        player.hp = Math.min(player.maxHp, player.hp + 25);
        player.state.hp = player.hp;
        fxRing(player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, ab.color, TILE_SIZE * 3);
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, 40, 90);
        log("Grito de Guerra! +50% ATK por 8s.");
        break;
      }
      case "earthquake": {
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, TILE_SIZE * 4);
        for (const m of monsters) {
          if (m.dead) continue;
          const d = Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty);
          if (d <= 3) { applyDamageToMonster(m, Math.floor(dmg * 1.3)); m.stunnedUntil = now + 2000; }
        }
        // dust particles
        for (let i = 0; i < 40; i++) {
          const ang = Math.random() * Math.PI * 2;
          makeParticle(player.px+TILE_SIZE/2, player.py+TILE_SIZE, 0xb45309, {
            vx: Math.cos(ang)*80, vy: Math.sin(ang)*60 - 20, life: 700, gravity: 80,
          });
        }
        break;
      }
      case "multishot": {
        const v = facingVec();
        // Straight
        spawnDirProjectile(v.x, v.y, 6, dmg, "arrow");
        // Two angled: rotate ±30°
        const ang = Math.atan2(v.y, v.x);
        const a1 = ang + Math.PI/8, a2 = ang - Math.PI/8;
        spawnDirProjectile(Math.cos(a1), Math.sin(a1), 6, dmg, "arrow");
        spawnDirProjectile(Math.cos(a2), Math.sin(a2), 6, dmg, "arrow");
        break;
      }
      case "piercing": {
        const v = facingVec();
        spawnDirProjectile(v.x, v.y, 8, Math.floor(dmg * 1.5), "arrow", { pierce: true });
        break;
      }
      case "trap": {
        const f = facingTile(player);
        const g = new Graphics();
        g.circle(0, 0, 10).stroke({ color: ab.color, width: 2, alpha: 0.9 })
         .circle(0, 0, 4).fill({ color: ab.color, alpha: 0.6 });
        g.x = f.x * TILE_SIZE + TILE_SIZE/2; g.y = f.y * TILE_SIZE + TILE_SIZE/2;
        fxLayer.addChild(g);
        traps.push({ gfx: g, tx: f.x, ty: f.y, damage: Math.floor(dmg * 2.5), triggered: false, born: now, life: 20000 });
        log("Armadilha armada.");
        break;
      }
      case "arrowRain": {
        // Rain arrows in radius 3 tiles over 800ms
        const cx = player.tx, cy = player.ty;
        const arrows = 12;
        for (let i = 0; i < arrows; i++) {
          setTimeout(() => {
            const rx = cx + ((Math.random()*7)|0) - 3;
            const ry = cy + ((Math.random()*7)|0) - 3;
            const g = new Graphics();
            g.rect(-2, -8, 4, 16).fill(0xfef3c7);
            g.x = rx * TILE_SIZE + TILE_SIZE/2; g.y = ry * TILE_SIZE + TILE_SIZE/2 - 80;
            fxLayer.addChild(g);
            projectiles.push({
              gfx: g, kind: "arrow",
              fromX: g.x, fromY: g.y, toX: g.x, toY: g.y + 80,
              start: performance.now(), dur: 200, damage: Math.floor(dmg * 0.9),
              onArrive: () => {
                for (const m of monsters) if (!m.dead && m.tx === rx && m.ty === ry) applyDamageToMonster(m, Math.floor(dmg * 0.9));
                fxBurst(g.x, g.y+80, 0xfef3c7, 6, 60, 300);
              },
            });
          }, i * 60);
        }
        break;
      }
      case "fireball": {
        const v = facingVec();
        spawnDirProjectile(v.x, v.y, 6, dmg, "fire", {
          onArrive: () => {
            // impact — impact position in projectile onArrive uses the current projectile gfx pos
          },
        });
        // Custom impact via projectile completion: replace last projectile's onArrive with an AoE
        const p = projectiles[projectiles.length - 1];
        p.onArrive = () => {
          const cx = p.toX, cy = p.toY;
          fxRing(cx, cy, 0xef4444, TILE_SIZE * 2.5);
          fxBurst(cx, cy, 0xfacc15, 40, 160);
          const tx = Math.floor(cx / TILE_SIZE), ty = Math.floor(cy / TILE_SIZE);
          for (const m of monsters) {
            if (m.dead) continue;
            if (Math.abs(m.tx-tx)+Math.abs(m.ty-ty) <= 1) applyDamageToMonster(m, Math.floor(dmg * 1.6));
          }
        };
        break;
      }
      case "iceNova": {
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, TILE_SIZE * 3);
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xbae6fd, 40, 130);
        for (const m of monsters) {
          if (m.dead) continue;
          const d = Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty);
          if (d <= 2) { applyDamageToMonster(m, Math.floor(dmg * 1.3)); m.stunnedUntil = now + 2500; }
        }
        break;
      }
      case "blink": {
        const v = facingVec();
        let steps = 0;
        for (let i = 1; i <= 5; i++) {
          const nx = player.tx + v.x * i, ny = player.ty + v.y * i;
          if (!isBlocked(map, nx, ny)) steps = i;
        }
        if (steps > 0) {
          // teleport-blink: also unstuck-safe by nearestWalkable
          const t = nearestWalkable(map, player.tx + v.x * steps, player.ty + v.y * steps);
          fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, 30, 120);
          player.tx = t.x; player.ty = t.y;
          player.px = player.toX = t.x * TILE_SIZE;
          player.py = player.toY = t.y * TILE_SIZE;
          fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, 30, 120);
        }
        break;
      }
      case "meteor": {
        const target = findRangedTarget(10);
        if (!target) { player.state.cooldowns[ab.id] = now + 500; break; }
        const cx = target.px + TILE_SIZE/2, cy = target.py + TILE_SIZE/2;
        const g = new Graphics();
        g.circle(0,0,14).fill(0xdc2626).circle(0,0,8).fill(0xfacc15).circle(0,0,3).fill(0xffffff);
        g.x = cx; g.y = cy - 300;
        fxLayer.addChild(g);
        projectiles.push({
          gfx: g, kind: "meteor",
          fromX: g.x, fromY: g.y, toX: cx, toY: cy,
          start: now, dur: 600, damage: Math.floor(dmg * 2.5),
          onArrive: () => {
            fxRing(cx, cy, 0xdc2626, TILE_SIZE * 4);
            fxBurst(cx, cy, 0xf97316, 60, 200);
            const tx = Math.floor(cx / TILE_SIZE), ty = Math.floor(cy / TILE_SIZE);
            for (const m of monsters) {
              if (m.dead) continue;
              if (Math.abs(m.tx-tx)+Math.abs(m.ty-ty) <= 2) applyDamageToMonster(m, Math.floor(dmg * 2.5));
            }
          },
        });
        break;
      }

      // ---------- PALADIN ----------
      case "holyShield": {
        player.state.holyShieldUntil = now + 6000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, TILE_SIZE * 2);
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xfde047, 30, 100);
        log("Escudo Sagrado ativo!");
        break;
      }
      case "hammerOfLight": {
        const v = facingVec();
        for (let i = 1; i <= 2; i++) {
          const tx = player.tx + v.x * i, ty = player.ty + v.y * i;
          fxRing(tx*TILE_SIZE+TILE_SIZE/2, ty*TILE_SIZE+TILE_SIZE/2, 0xfacc15, TILE_SIZE*1.4);
          for (const m of monsters) {
            if (m.dead || m.friendly) continue;
            if (Math.abs(m.tx-tx)+Math.abs(m.ty-ty) <= 1) {
              applyDamageToMonster(m, Math.floor(dmg * 1.4));
              m.stunnedUntil = now + 1500;
            }
          }
        }
        break;
      }
      case "consecrate": {
        player.state.consecrateUntil = now + 6000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xfef08a, TILE_SIZE*3);
        log("Terra consagrada queima inimigos!");
        break;
      }
      case "divineHeal": {
        player.hp = player.maxHp; player.state.hp = player.hp;
        for (const m of monsters) if (m.friendly && !m.dead) { m.hp = m.maxHp; fxHeal(m); }
        fxHeal(player);
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xffffff, TILE_SIZE*3);
        break;
      }

      // ---------- ASSASSIN ----------
      case "dashStrike": {
        const v = facingVec();
        let steps = 0;
        for (let i = 1; i <= 4; i++) {
          const nx = player.tx + v.x * i, ny = player.ty + v.y * i;
          if (isBlocked(map, nx, ny)) break;
          steps = i;
        }
        if (steps > 0) {
          player.tx += v.x * steps; player.ty += v.y * steps;
          player.px = player.toX = player.tx * TILE_SIZE;
          player.py = player.toY = player.ty * TILE_SIZE;
        }
        const f = facingTile(player);
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (m.tx === f.x && m.ty === f.y) applyDamageToMonster(m, Math.floor(dmg * 2.4));
        }
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, 25, 160);
        break;
      }
      case "shadowStep": {
        player.state.invisibleUntil = now + 4000;
        player.state.nextAttackCrit = true;
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x1e1b4b, 30, 120);
        log("Você desaparece nas sombras.");
        break;
      }
      case "poisonBlade": {
        player.state.poisonBladeUntil = now + 10000;
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 1) {
            applyPoison(m, Math.max(3, Math.floor(dmg * 0.5)));
          }
        }
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x84cc16, TILE_SIZE*1.5);
        break;
      }
      case "bladeFury": {
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            let best: Monster | null = null; let bd = Infinity;
            for (const m of monsters) {
              if (m.dead || m.friendly) continue;
              const d = Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty);
              if (d <= 2 && d < bd) { bd = d; best = m; }
            }
            if (best) { applyDamageToMonster(best, Math.floor(dmg * 0.9)); playAttackFx(best); }
          }, i * 90);
        }
        break;
      }

      // ---------- BERSERKER ----------
      case "berserkRage": {
        player.state.berserkUntil = now + 6000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xdc2626, TILE_SIZE*2);
        log("FÚRIA! Dano dobrado.");
        break;
      }
      case "bloodAxe": {
        const f = facingTile(player);
        let hit = 0;
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (m.tx === f.x && m.ty === f.y) { applyDamageToMonster(m, Math.floor(dmg * 1.8)); hit += Math.floor(dmg * 0.8); }
        }
        if (hit > 0) { player.hp = Math.min(player.maxHp, player.hp + hit); player.state.hp = player.hp; fxHeal(player); }
        break;
      }
      case "quakeSlam": {
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x92400e, TILE_SIZE*5);
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          const d = Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty);
          if (d <= 4) { applyDamageToMonster(m, Math.floor(dmg * 1.5)); m.stunnedUntil = now + 2500; }
        }
        break;
      }
      case "reckless": {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xf59e0b, TILE_SIZE*2);
            for (const m of monsters) {
              if (m.dead || m.friendly) continue;
              if (Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 1) applyDamageToMonster(m, Math.floor(dmg * 1.3));
            }
          }, i * 200);
        }
        break;
      }

      // ---------- ELEMENTALIST ----------
      case "chainLightning": {
        let src: Monster | null = findRangedTarget(6);
        const hit = new Set<Monster>();
        for (let i = 0; i < 5 && src; i++) {
          hit.add(src);
          const g = new Graphics();
          const from = i === 0 ? { x: player.px+TILE_SIZE/2, y: player.py+TILE_SIZE/2 } : { x: [...hit][i-1].px+TILE_SIZE/2, y: [...hit][i-1].py+TILE_SIZE/2 };
          g.moveTo(from.x, from.y).lineTo(src.px+TILE_SIZE/2, src.py+TILE_SIZE/2)
            .stroke({ color: 0x38bdf8, width: 3, alpha: 0.9 });
          fxLayer.addChild(g);
          fxParticles.push({ gfx: g, born: now, life: 300, vx: 0, vy: 0, gravity: 0, alphaFrom: 0.9, scaleFrom: 1, scaleTo: 1 });
          applyDamageToMonster(src, Math.floor(dmg * (1.3 - i * 0.15)));
          // find next
          let next: Monster | null = null; let bd = Infinity;
          for (const m of monsters) {
            if (m.dead || m.friendly || hit.has(m)) continue;
            const d = Math.abs(m.tx-src.tx)+Math.abs(m.ty-src.ty);
            if (d <= 4 && d < bd) { bd = d; next = m; }
          }
          src = next;
        }
        break;
      }
      case "flameWave": {
        const v = facingVec();
        for (let i = 1; i <= 4; i++) {
          const tx = player.tx + v.x * i, ty = player.ty + v.y * i;
          const cx = tx*TILE_SIZE+TILE_SIZE/2, cy = ty*TILE_SIZE+TILE_SIZE/2;
          fxBurst(cx, cy, 0xf97316, 12, 80, 350);
          for (const m of monsters) {
            if (m.dead || m.friendly) continue;
            if (Math.abs(m.tx-tx)+Math.abs(m.ty-ty) <= 1) {
              applyDamageToMonster(m, Math.floor(dmg * 1.1));
              m.burningUntil = now + 3000; m.burnTick = now + 500;
            }
          }
        }
        break;
      }
      case "frostArmor": {
        player.state.frostArmorUntil = now + 8000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x60a5fa, TILE_SIZE*2);
        break;
      }
      case "elementalStorm": {
        const cx = player.tx, cy = player.ty;
        for (let i = 0; i < 18; i++) {
          setTimeout(() => {
            const rx = cx + ((Math.random()*7)|0) - 3;
            const ry = cy + ((Math.random()*7)|0) - 3;
            const gx = rx*TILE_SIZE+TILE_SIZE/2, gy = ry*TILE_SIZE+TILE_SIZE/2;
            const kind = i % 3;
            const color = kind === 0 ? 0xef4444 : kind === 1 ? 0x38bdf8 : 0xfde047;
            fxBurst(gx, gy, color, 12, 100, 400);
            fxRing(gx, gy, color, TILE_SIZE * 1.4);
            for (const m of monsters) {
              if (m.dead || m.friendly) continue;
              if (m.tx === rx && m.ty === ry) {
                applyDamageToMonster(m, Math.floor(dmg * 1.2));
                if (kind === 1) m.chilledUntil = performance.now() + 2500;
                if (kind === 0) { m.burningUntil = performance.now() + 2500; m.burnTick = performance.now() + 500; }
              }
            }
          }, i * 70);
        }
        break;
      }

      // ---------- NECROMANCER ----------
      case "summonSkeleton": {
        // Remove old minions first (only one at a time)
        for (const m of monsters) if (m.friendly && !m.dead) { m.hp = 0; m.dead = true; m.sprite.visible = false; }
        summonSkeleton();
        break;
      }
      case "lifeDrain": {
        const target = findRangedTarget(6);
        if (!target) { player.state.cooldowns[ab.id] = now + 500; break; }
        const g = new Graphics();
        g.moveTo(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2)
          .lineTo(target.px+TILE_SIZE/2, target.py+TILE_SIZE/2)
          .stroke({ color: 0x7c3aed, width: 4, alpha: 0.9 });
        fxLayer.addChild(g);
        fxParticles.push({ gfx: g, born: now, life: 400, vx: 0, vy: 0, gravity: 0, alphaFrom: 0.9, scaleFrom: 1, scaleTo: 1 });
        const heal = Math.floor(dmg * 1.4);
        applyDamageToMonster(target, heal);
        player.hp = Math.min(player.maxHp, player.hp + Math.floor(heal * 0.7));
        player.state.hp = player.hp;
        fxHeal(player);
        break;
      }
      case "boneShield": {
        player.state.boneShieldUntil = now + 8000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xd1d5db, TILE_SIZE*2);
        break;
      }
      case "plague": {
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 3) {
            m.plagueUntil = now + 8000;
            m.plagueTick = now + 700;
            m.poisonedUntil = now + 8000;
            m.poisonDmg = Math.max(3, Math.floor(dmg * 0.3));
            m.poisonTick = now + 500;
          }
        }
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x14532d, TILE_SIZE*3.5);
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x65a30d, 40, 130);
        break;
      }

      // ---- NEW ABILITIES (2 per class) ----
      case "shockwave": {
        const v = facingVec();
        for (let i = 1; i <= 4; i++) {
          const tx = player.tx + v.x * i, ty = player.ty + v.y * i;
          const cx = tx*TILE_SIZE+TILE_SIZE/2, cy = ty*TILE_SIZE+TILE_SIZE/2;
          fxRing(cx, cy, ab.color, TILE_SIZE*1.4);
          fxBurst(cx, cy, 0xfef3c7, 15, 90, 300);
          for (const m of monsters) {
            if (m.dead || m.friendly) continue;
            if (Math.abs(m.tx-tx)+Math.abs(m.ty-ty) <= 1) {
              applyDamageToMonster(m, Math.floor(dmg * 1.25));
              m.stunnedUntil = now + 1500;
            }
          }
        }
        break;
      }
      case "bloodlust": {
        player.state.bloodlustUntil = now + 8000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xdc2626, TILE_SIZE*2);
        for (let i = 0; i < 20; i++) {
          const ang = Math.random()*Math.PI*2;
          makeParticle(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xdc2626, {
            vx: Math.cos(ang)*40, vy: Math.sin(ang)*40 - 20, life: 800, gravity: 20,
          });
        }
        log("Sede de Sangue! Cura 25% do dano por 8s.");
        break;
      }
      case "evadeRoll": {
        const v = facingVec();
        let steps = 0;
        for (let i = 1; i <= 3; i++) {
          const nx = player.tx - v.x * i, ny = player.ty - v.y * i;
          if (isBlocked(map, nx, ny)) break;
          steps = i;
        }
        if (steps > 0) {
          player.tx -= v.x * steps; player.ty -= v.y * steps;
          player.px = player.toX = player.tx * TILE_SIZE;
          player.py = player.toY = player.ty * TILE_SIZE;
        }
        player.state.invisibleUntil = now + 3000;
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, 25, 130);
        break;
      }
      case "explosiveArrow": {
        const v = facingVec();
        spawnDirProjectile(v.x, v.y, 7, dmg, "arrow");
        const p = projectiles[projectiles.length - 1];
        if (p) {
          p.onArrive = () => {
            const cx = p.toX, cy = p.toY;
            fxRing(cx, cy, 0xf97316, TILE_SIZE * 3);
            fxBurst(cx, cy, 0xfef3c7, 50, 180);
            const tx = Math.floor(cx / TILE_SIZE), ty = Math.floor(cy / TILE_SIZE);
            for (const m of monsters) {
              if (m.dead || m.friendly) continue;
              if (Math.abs(m.tx-tx)+Math.abs(m.ty-ty) <= 2) applyDamageToMonster(m, Math.floor(dmg * 1.8));
            }
          };
        }
        break;
      }
      case "arcaneOrb": {
        player.state.arcaneOrbUntil = now + 8000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, ab.color, TILE_SIZE*2.5);
        log("Orbe Arcano ativo!");
        break;
      }
      case "manaShield": {
        player.state.manaShieldUntil = now + 6000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x60a5fa, TILE_SIZE*2);
        fxBurst(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xa5f3fc, 30, 120);
        break;
      }
      case "judgment": {
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 4) {
            const cx = m.px+TILE_SIZE/2, cy = m.py+TILE_SIZE/2;
            fxRing(cx, cy, 0xfef3c7, TILE_SIZE*1.3);
            fxBurst(cx, cy, 0xfffbeb, 20, 110);
            applyDamageToMonster(m, Math.floor(dmg * 1.6));
          }
        }
        break;
      }
      case "avengerWings": {
        const target = findRangedTarget(8);
        if (target) {
          player.tx = target.tx; player.ty = target.ty - 1;
          if (isBlocked(map, player.tx, player.ty)) { player.tx = target.tx + 1; player.ty = target.ty; }
          player.px = player.toX = player.tx * TILE_SIZE;
          player.py = player.toY = player.ty * TILE_SIZE;
          fxRing(target.px+TILE_SIZE/2, target.py+TILE_SIZE/2, 0xfef08a, TILE_SIZE*2.5);
          fxBurst(target.px+TILE_SIZE/2, target.py+TILE_SIZE/2, 0xfef3c7, 40, 160);
          for (const m of monsters) {
            if (m.dead || m.friendly) continue;
            if (Math.abs(m.tx-target.tx)+Math.abs(m.ty-target.ty) <= 1) applyDamageToMonster(m, Math.floor(dmg * 2.0));
          }
        }
        break;
      }
      case "smokeBomb": {
        player.state.invisibleUntil = now + 4000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x475569, TILE_SIZE*3);
        for (let i = 0; i < 30; i++) {
          const ang = Math.random()*Math.PI*2;
          makeParticle(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0x94a3b8, {
            vx: Math.cos(ang)*60, vy: Math.sin(ang)*60, life: 1200, gravity: -10,
          });
        }
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 2) m.stunnedUntil = now + 4000;
        }
        break;
      }
      case "deathMark": {
        const target = findRangedTarget(6);
        if (target) {
          const uid = (target as unknown as { __uid: number }).__uid;
          player.state.deathMarkTargetUid = uid;
          player.state.deathMarkUntil = now + 5000;
          fxRing(target.px+TILE_SIZE/2, target.py+TILE_SIZE/2, 0x7f1d1d, TILE_SIZE*1.6);
        }
        break;
      }
      case "warBanner": {
        player.state.warBannerUntil = now + 10000;
        fxRing(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2, 0xf59e0b, TILE_SIZE*3);
        log("Estandarte plantado! +40% dano.");
        break;
      }
      case "frenzy": {
        for (let round = 0; round < 4; round++) {
          setTimeout(() => {
            for (const m of monsters) {
              if (m.dead || m.friendly) continue;
              if (Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 1) {
                applyDamageToMonster(m, Math.floor(dmg * 0.7));
                playAttackFx(m);
              }
            }
          }, round * 120);
        }
        break;
      }
      case "earthSpike": {
        const v = facingVec();
        for (let i = 1; i <= 5; i++) {
          const tx = player.tx + v.x * i, ty = player.ty + v.y * i;
          const cx = tx*TILE_SIZE+TILE_SIZE/2, cy = ty*TILE_SIZE+TILE_SIZE/2;
          setTimeout(() => {
            fxRing(cx, cy, 0xb45309, TILE_SIZE*1.2);
            for (let k = 0; k < 8; k++) {
              const ang = Math.random()*Math.PI*2;
              makeParticle(cx, cy, 0x92400e, { vx: Math.cos(ang)*50, vy: -80, life: 500, gravity: 200 });
            }
            for (const m of monsters) {
              if (m.dead || m.friendly) continue;
              if (m.tx === tx && m.ty === ty) {
                applyDamageToMonster(m, Math.floor(dmg * 1.4));
                m.stunnedUntil = performance.now() + 1500;
              }
            }
          }, i * 80);
        }
        break;
      }
      case "voidRift": {
        const cx = player.tx, cy = player.ty;
        fxRing(cx*TILE_SIZE+TILE_SIZE/2, cy*TILE_SIZE+TILE_SIZE/2, 0x581c87, TILE_SIZE*4);
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          const d = Math.abs(m.tx-cx)+Math.abs(m.ty-cy);
          if (d <= 4) {
            // Pull toward center
            const dx = Math.sign(cx - m.tx), dy = Math.sign(cy - m.ty);
            const nx = m.tx + dx, ny = m.ty + dy;
            if (!isBlocked(map, nx, ny)) { m.tx = nx; m.ty = ny; m.px = m.toX = nx*TILE_SIZE; m.py = m.toY = ny*TILE_SIZE; }
            applyDamageToMonster(m, Math.floor(dmg * 2.0));
          }
        }
        setTimeout(() => {
          fxBurst(cx*TILE_SIZE+TILE_SIZE/2, cy*TILE_SIZE+TILE_SIZE/2, 0x8b5cf6, 60, 200);
          fxRing(cx*TILE_SIZE+TILE_SIZE/2, cy*TILE_SIZE+TILE_SIZE/2, 0xa78bfa, TILE_SIZE*3);
          for (const m of monsters) {
            if (m.dead || m.friendly) continue;
            if (Math.abs(m.tx-cx)+Math.abs(m.ty-cy) <= 1) applyDamageToMonster(m, Math.floor(dmg * 2.5));
          }
        }, 500);
        break;
      }
      case "corpseExplode": {
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (m.hp / m.maxHp <= 0.3) {
            fxRing(m.px+TILE_SIZE/2, m.py+TILE_SIZE/2, 0xf3f4f6, TILE_SIZE*2);
            fxBurst(m.px+TILE_SIZE/2, m.py+TILE_SIZE/2, 0xd1d5db, 30, 140);
            applyDamageToMonster(m, m.hp + 1);
            // Splash to neighbors
            for (const n of monsters) {
              if (n === m || n.dead || n.friendly) continue;
              if (Math.abs(n.tx-m.tx)+Math.abs(n.ty-m.ty) <= 2) applyDamageToMonster(n, Math.floor(dmg * 1.5));
            }
          }
        }
        break;
      }
      case "soulHarvest": {
        let stolen = 0;
        for (const m of monsters) {
          if (m.dead || m.friendly) continue;
          if (Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 3) {
            applyDamageToMonster(m, Math.floor(dmg * 1.3));
            stolen += Math.floor(dmg * 0.6);
            const g = new Graphics();
            g.moveTo(m.px+TILE_SIZE/2, m.py+TILE_SIZE/2)
              .lineTo(player.px+TILE_SIZE/2, player.py+TILE_SIZE/2)
              .stroke({ color: 0x7c3aed, width: 2, alpha: 0.8 });
            fxLayer.addChild(g);
            fxParticles.push({ gfx: g, born: now, life: 400, vx: 0, vy: 0, gravity: 0, alphaFrom: 0.8, scaleFrom: 1, scaleTo: 1 });
          }
        }
        if (stolen > 0) { player.hp = Math.min(player.maxHp, player.hp + stolen); player.state.hp = player.hp; fxHeal(player); }
        break;
      }
    }
    checkAchievements();
    notifyUi();
  }

  // ---- Ability shop/loadout ----
  function buyAbility(id: string) {
    const cls = player.state.cls;
    const ab = ABILITIES[cls].find(a => a.id === id);
    if (!ab) return;
    if (player.state.ownedAbilities[cls].includes(id)) { log("Habilidade já comprada."); return; }
    if (player.state.gold < ab.cost) { log(`Faltam ${ab.cost - player.state.gold}g.`); return; }
    player.state.gold -= ab.cost;
    player.state.ownedAbilities[cls] = [...player.state.ownedAbilities[cls], id];
    log(`Comprou ${ab.name} por ${ab.cost}g!`);
    notifyUi();
  }
  function equipAbility(slotIndex: 0 | 1 | 2 | 3, abilityId: string | null) {
    const cls = player.state.cls;
    if (abilityId && !player.state.ownedAbilities[cls].includes(abilityId)) return;
    const loadout = [...player.state.abilityLoadout[cls]];
    // Remove from any other slot to prevent duplicates
    if (abilityId) for (let i = 0; i < 4; i++) if (loadout[i] === abilityId) loadout[i] = null;
    loadout[slotIndex] = abilityId;
    player.state.abilityLoadout[cls] = loadout;
    notifyUi();
  }

  let inputDir: { x: number; y: number } | null = null;

  function tryStep(e: Entity, dx: number, dy: number, now: number, stepMs: number): boolean {
    if (dx < 0) e.dir = DIR_LEFT;
    else if (dx > 0) e.dir = DIR_RIGHT;
    else if (dy < 0) e.dir = DIR_UP;
    else if (dy > 0) e.dir = DIR_DOWN;
    const nx = e.tx + dx, ny = e.ty + dy;
    if (isBlocked(map, nx, ny)) return false;
    if (e.kind === "player") {
      for (const m of monsters) if (!m.dead && m.tx === nx && m.ty === ny) return false;
    } else {
      if (player.tx === nx && player.ty === ny) return false;
      for (const m of monsters) if (m !== e && !m.dead && m.tx === nx && m.ty === ny) return false;
    }
    e.tx = nx; e.ty = ny;
    e.fromX = e.px; e.fromY = e.py;
    e.toX = nx * TILE_SIZE; e.toY = ny * TILE_SIZE;
    e.stepStart = now; e.stepDur = stepMs;
    fxStep(e);
    return true;
  }
  function facingTile(e: Entity): { x: number; y: number } {
    switch (e.dir) {
      case DIR_LEFT:  return { x: e.tx - 1, y: e.ty };
      case DIR_RIGHT: return { x: e.tx + 1, y: e.ty };
      case DIR_UP:    return { x: e.tx, y: e.ty - 1 };
      default:        return { x: e.tx, y: e.ty + 1 };
    }
  }
  function isMoving(e: Entity, now: number): boolean {
    return now - e.stepStart < e.stepDur;
  }

  let lastTs = performance.now();
  let lastBiome = currentBiomeIdAtPlayer();
  let tanTicker = 0;
  const tickFn = () => {
    const now = performance.now();
    const dt = now - lastTs; lastTs = now;
    updateTileWindow();

    if (!isMoving(player, now)) {
      const s = stairAt(map, player.tx, player.ty);
      if (s) { loadMapById(s.target, { x: s.dstX, y: s.dstY }); return; }
    }

    if (!isMoving(player, now) && inputDir) {
      const dx = inputDir.x === 0 ? 0 : Math.sign(inputDir.x);
      const dy = inputDir.y === 0 ? 0 : Math.sign(inputDir.y);
      if (dx !== 0) tryStep(player, dx, 0, now, PLAYER_STEP_MS);
      else if (dy !== 0) tryStep(player, 0, dy, now, PLAYER_STEP_MS);
    }

    if (wantAttack) { tryAttack(now); wantAttack = false; }

    // Biome change detection: re-apply shader & track visits.
    const curBiome = currentBiomeIdAtPlayer();
    if (curBiome !== lastBiome) {
      lastBiome = curBiome;
      applyBiomeShader(curBiome);
      if (!player.state.biomesVisited.includes(curBiome)) {
        player.state.biomesVisited.push(curBiome);
        checkAchievements();
      }
      notifyUi();
    }

    // Tanning system: gain tan in sunny biomes at a slow rate.
    tanTicker += dt;
    if (tanTicker > 250) {
      tanTicker = 0;
      const sunny = BIOMES[curBiome]?.sunny && !map.isDungeon;
      if (sunny && player.state.tan < 10) {
        player.state.tanXp += 1;
        if (player.state.tanXp >= 100) {
          player.state.tanXp = 0;
          player.state.tan += 1;
          log(`Bronzeamento nível ${player.state.tan}!`);
          checkAchievements();
        }
        notifyUi();
      }
    }

    // Traps
    for (let i = traps.length - 1; i >= 0; i--) {
      const t = traps[i];
      if (now - t.born > t.life) {
        fxLayer.removeChild(t.gfx); t.gfx.destroy(); traps.splice(i, 1); continue;
      }
      if (t.triggered) continue;
      for (const m of monsters) {
        if (!m.dead && m.tx === t.tx && m.ty === t.ty) {
          t.triggered = true;
          fxBurst(t.gfx.x, t.gfx.y, 0xa3e635, 25, 130);
          applyDamageToMonster(m, t.damage);
          m.stunnedUntil = now + 1500;
          fxLayer.removeChild(t.gfx); t.gfx.destroy(); traps.splice(i, 1);
          break;
        }
      }
    }

    // ---- DoT ticks & minion expiry ----
    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      if (m.dead) continue;
      // Minion expiry
      if (m.friendly && m.expiresAt && now >= m.expiresAt) {
        fxBurst(m.px+TILE_SIZE/2, m.py+TILE_SIZE/2, 0xd6d3d1, 14, 60, 400);
        m.dead = true; m.sprite.visible = false;
        if (m.hpBar) m.hpBar.visible = false;
        if (m.hpLabel) m.hpLabel.visible = false;
        continue;
      }
      // Poison
      if (m.poisonedUntil && now < m.poisonedUntil && m.poisonTick && now >= m.poisonTick) {
        m.poisonTick = now + 500;
        m.hp -= (m.poisonDmg ?? 1);
        floatText(m.px, m.py, String(m.poisonDmg ?? 1), 0x84cc16);
        if (m.hp <= 0) applyDamageToMonster(m, 0);
      }
      // Burn
      if (m.burningUntil && now < m.burningUntil && m.burnTick && now >= m.burnTick) {
        m.burnTick = now + 500;
        const bd = Math.max(2, Math.floor(playerDamage() * 0.2));
        m.hp -= bd;
        floatText(m.px, m.py, String(bd), 0xf97316);
        if (m.hp <= 0) applyDamageToMonster(m, 0);
      }
      // Plague spread
      if (m.plagueUntil && now < m.plagueUntil && m.plagueTick && now >= m.plagueTick) {
        m.plagueTick = now + 1200;
        for (const n of monsters) {
          if (n === m || n.dead || n.friendly) continue;
          if (n.plagueUntil && now < n.plagueUntil) continue;
          if (Math.abs(n.tx-m.tx)+Math.abs(n.ty-m.ty) <= 1) {
            n.plagueUntil = now + 6000; n.plagueTick = now + 1200;
            n.poisonedUntil = now + 6000; n.poisonDmg = m.poisonDmg ?? 3; n.poisonTick = now + 500;
          }
        }
      }
      // Consecrate: burn nearby enemies
      if (!m.friendly && now < player.state.consecrateUntil && Math.abs(m.tx-player.tx)+Math.abs(m.ty-player.ty) <= 2) {
        if (!m.burningUntil || m.burningUntil < now + 500) {
          m.burningUntil = now + 800; m.burnTick = now + 400;
        }
      }
    }

    // ---- AI: skeleton minion (friendly) attacks nearest enemy ----
    const playerInvisible = player.state.cls === "assassin" && now < player.state.invisibleUntil;

    for (const m of monsters) {
      if (m.dead) continue;
      if (now < m.stunnedUntil) continue;
      if (isMoving(m, now)) continue;

      // Chill slows step time
      let effStepMs = m.def.stepMs;
      if (m.chilledUntil && now < m.chilledUntil) effStepMs = Math.floor(effStepMs * 1.6);

      if (m.friendly) {
        // Friendly skeleton: hunt nearest hostile
        let best: Monster | null = null; let bd = Infinity;
        for (const e of monsters) {
          if (e === m || e.dead || e.friendly) continue;
          const d = Math.abs(e.tx - m.tx) + Math.abs(e.ty - m.ty);
          if (d < bd) { bd = d; best = e; }
        }
        if (!best) {
          // Follow player loosely
          const d = Math.abs(player.tx-m.tx)+Math.abs(player.ty-m.ty);
          if (d > 3 && now >= m.nextThinkAt) {
            m.nextThinkAt = now + 400;
            const dx = Math.sign(player.tx-m.tx), dy = Math.sign(player.ty-m.ty);
            if (Math.abs(player.tx-m.tx) >= Math.abs(player.ty-m.ty)) {
              if (dx !== 0 && !tryStep(m, dx, 0, now, effStepMs) && dy !== 0) tryStep(m, 0, dy, now, effStepMs);
            } else if (dy !== 0) {
              if (!tryStep(m, 0, dy, now, effStepMs) && dx !== 0) tryStep(m, dx, 0, now, effStepMs);
            }
          }
          continue;
        }
        const distX = best.tx - m.tx, distY = best.ty - m.ty;
        if (distX < 0) m.dir = DIR_LEFT; else if (distX > 0) m.dir = DIR_RIGHT;
        else if (distY < 0) m.dir = DIR_UP; else m.dir = DIR_DOWN;
        if (bd === 1) {
          if (now - m.lastAttackAt >= ATTACK_COOLDOWN_MS) {
            m.lastAttackAt = now;
            applyDamageToMonster(best, m.damage);
            playAttackFx({ px: best.px, py: best.py });
          }
          continue;
        }
        const dx = distX === 0 ? 0 : Math.sign(distX);
        const dy = distY === 0 ? 0 : Math.sign(distY);
        const tryX = Math.abs(distX) >= Math.abs(distY);
        if (tryX && dx !== 0) {
          if (!tryStep(m, dx, 0, now, effStepMs) && dy !== 0) tryStep(m, 0, dy, now, effStepMs);
        } else if (dy !== 0) {
          if (!tryStep(m, 0, dy, now, effStepMs) && dx !== 0) tryStep(m, dx, 0, now, effStepMs);
        }
        continue;
      }

      // Hostile monster: pick nearest of {player, any friendly minion}
      let tX = player.tx, tY = player.ty, tPlayer = true;
      let bd = playerInvisible ? Infinity : Math.abs(player.tx-m.tx)+Math.abs(player.ty-m.ty);
      let tMinion: Monster | null = null;
      for (const f of monsters) {
        if (!f.friendly || f.dead) continue;
        const d = Math.abs(f.tx-m.tx)+Math.abs(f.ty-m.ty);
        if (d < bd) { bd = d; tX = f.tx; tY = f.ty; tPlayer = false; tMinion = f; }
      }
      if (!isFinite(bd)) {
        if (now >= m.nextThinkAt) {
          m.nextThinkAt = now + 1400 + Math.random() * 1400;
          const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
          const [rx, ry] = dirs[(Math.random() * 4) | 0];
          tryStep(m, rx, ry, now, effStepMs);
        }
        continue;
      }
      const distX = tX - m.tx, distY = tY - m.ty;
      if (distX < 0) m.dir = DIR_LEFT; else if (distX > 0) m.dir = DIR_RIGHT;
      else if (distY < 0) m.dir = DIR_UP; else m.dir = DIR_DOWN;
      if (bd === 1) {
        if (now - m.lastAttackAt >= ATTACK_COOLDOWN_MS) {
          m.lastAttackAt = now;
          if (tPlayer) {
            const dmg = playerDefenseMitigation(m.damage);
            // Frost armor retaliation
            if (now < player.state.frostArmorUntil) {
              m.chilledUntil = now + 2500;
              applyDamageToMonster(m, Math.max(1, Math.floor(m.damage * 0.6)));
            }
            player.hp -= dmg;
            player.state.hp = Math.max(0, player.hp);
            fxHit(player);
            floatText(player.px, player.py, String(dmg), 0xfca5a5);
            gainSkillXp("defense", SKILL_XP_PER_HIT);
            if (player.hp <= 0) {
              log("Você caiu. Retornando ao Prado.");
              player.state.xp = Math.max(0, player.state.xp - Math.floor(player.state.xpNext * 0.1));
              player.hp = player.maxHp;
              player.state.hp = player.maxHp;
              loadMapById("__overworld__");
            }
            notifyUi();
          } else if (tMinion) {
            applyDamageToMonster(tMinion, m.damage);
          }
        }
        continue;
      }
      if (bd <= m.def.aggroRadius) {
        const dx = distX === 0 ? 0 : Math.sign(distX);
        const dy = distY === 0 ? 0 : Math.sign(distY);
        const tryX = Math.abs(distX) >= Math.abs(distY);
        if (tryX && dx !== 0) {
          if (!tryStep(m, dx, 0, now, effStepMs) && dy !== 0) tryStep(m, 0, dy, now, effStepMs);
        } else if (dy !== 0) {
          if (!tryStep(m, 0, dy, now, effStepMs) && dx !== 0) tryStep(m, dx, 0, now, effStepMs);
        }
      } else if (now >= m.nextThinkAt) {
        m.nextThinkAt = now + 1400 + Math.random() * 1400;
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        const [rx, ry] = dirs[(Math.random() * 4) | 0];
        tryStep(m, rx, ry, now, effStepMs);
      }
    }

    const all: Entity[] = [player, ...monsters.filter(m => !m.dead)];
    for (const e of all) {
      const moving = isMoving(e, now);
      if (moving) {
        const t = (now - e.stepStart) / e.stepDur;
        e.px = e.fromX + (e.toX - e.fromX) * t;
        e.py = e.fromY + (e.toY - e.fromY) * t;
        e.frameTime += dt;
        if (e.frameTime > 90) { e.frameTime = 0; e.frame = (e.frame + 1) % 4; }
      } else {
        e.px = e.toX; e.py = e.toY; e.frame = 0;
      }
      e.sprite.x = e.px; e.sprite.y = e.py;
      // Use the same sheet-selection helper as spawnMonster. Previously this
      // loop only branched on `def.sprite === "slime"` and fell back to the
      // goblin sheet every frame, which is why banker/dummy/blacksmith (and
      // any enemy whose `def.sprite` wasn't "slime") rendered as red goblins.
      const sheet = e.kind === "player"
        ? sheetForClass(player.state.cls)
        : sheetForMonster((e as Monster).def);
      e.sprite.texture = frameTex(sheet, e.dir, e.frame);
      if (now < e.hitFlashUntil) {
        e.sprite.tint = 0xffffff;
        e.sprite.alpha = 0.85;
      } else if (e.kind === "player") {
        const classTint = CLASSES[player.state.cls].spriteTint;
        // Assassin invisibility
        if (player.state.cls === "assassin" && now < (player.state as unknown as { invisibleUntil?: number }).invisibleUntil!) {
          e.sprite.alpha = 0.35;
        } else {
          e.sprite.alpha = 1;
        }
        // Apply tan darkening on top of class tint
        const t = Math.min(1, player.state.tan / 10);
        const shade = 1 - t * 0.35;
        const r = Math.round(((classTint >> 16) & 0xff) * shade);
        const g = Math.round(((classTint >> 8) & 0xff) * shade);
        const b = Math.round((classTint & 0xff) * shade);
        e.sprite.tint = (r << 16) | (g << 8) | b;
      } else {
        const baseTint = ((e as Monster).def.tint ?? 0xffffff);
        e.sprite.tint = baseTint;
        // Skeleton minion: subtle pulse
        if (e.kind === "monster" && (e as Monster).def.id === "skeleton_minion") {
          e.sprite.alpha = 0.85 + Math.sin(now / 200) * 0.1;
        } else {
          e.sprite.alpha = 1;
        }
      }
      drawHpBar(e);
    }

    // Warcry aura
    auraGfx.clear();
    if (now < player.state.buffAtkUntil) {
      const pulse = 0.6 + Math.sin(now / 120) * 0.2;
      auraGfx.circle(player.px + TILE_SIZE/2, player.py + TILE_SIZE - 2, TILE_SIZE * 0.5)
        .stroke({ color: 0xfbbf24, width: 2, alpha: pulse });
    }
    // Bone shield aura (necromancer)
    const boneUntil = (player.state as unknown as { boneShieldUntil?: number }).boneShieldUntil ?? 0;
    if (now < boneUntil) {
      const pulse = 0.5 + Math.sin(now / 100) * 0.3;
      auraGfx.circle(player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, TILE_SIZE * 0.7)
        .stroke({ color: 0xd1d5db, width: 3, alpha: pulse });
      for (let i = 0; i < 6; i++) {
        const ang = (now / 400) + (i * Math.PI / 3);
        const bx = player.px + TILE_SIZE/2 + Math.cos(ang) * TILE_SIZE * 0.7;
        const by = player.py + TILE_SIZE/2 + Math.sin(ang) * TILE_SIZE * 0.7;
        auraGfx.circle(bx, by, 3).fill({ color: 0xf5f5f4, alpha: 0.9 });
      }
    }
    // Holy shield aura (paladin)
    const holyUntil = (player.state as unknown as { holyShieldUntil?: number }).holyShieldUntil ?? 0;
    if (now < holyUntil) {
      const pulse = 0.6 + Math.sin(now / 150) * 0.3;
      auraGfx.circle(player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, TILE_SIZE * 0.7)
        .stroke({ color: 0xfde047, width: 3, alpha: pulse });
    }
    // Frost armor (elementalist)
    const frostUntil = (player.state as unknown as { frostArmorUntil?: number }).frostArmorUntil ?? 0;
    if (now < frostUntil) {
      const pulse = 0.5 + Math.sin(now / 200) * 0.3;
      auraGfx.circle(player.px + TILE_SIZE/2, player.py + TILE_SIZE/2, TILE_SIZE * 0.65)
        .stroke({ color: 0x60a5fa, width: 2, alpha: pulse });
    }

    {
      const cls2 = CLASSES[player.state.cls];
      classOverlay.clear();
      const cx = player.px + TILE_SIZE / 2;
      const cy = player.py + TILE_SIZE / 2;
      drawWeapon(classOverlay, cls2.weapon, cx, cy, cls2.color);
    }

    const cls = CLASSES[player.state.cls];
    classRing.clear();
    classRing.ellipse(0, 0, TILE_SIZE * 0.4, TILE_SIZE * 0.14)
      .stroke({ color: cls.color, width: 2, alpha: 0.9 });
    classRing.x = player.px + TILE_SIZE / 2;
    classRing.y = player.py + TILE_SIZE - 2;

    entityLayer.children.sort((a: { y: number }, b: { y: number }) => a.y - b.y);

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      const t = Math.min(1, (now - p.start) / p.dur);
      p.gfx.x = p.fromX + (p.toX - p.fromX) * t;
      p.gfx.y = p.fromY + (p.toY - p.fromY) * t;
      p.gfx.rotation = Math.atan2(p.toY - p.fromY, p.toX - p.fromX);
      if (p.pierce && p.hitIds) {
        for (const m of monsters) {
          if (m.dead) continue;
          const uid = (m as unknown as { __uid: number }).__uid;
          if (p.hitIds.has(uid)) continue;
          const dx = m.px + TILE_SIZE/2 - p.gfx.x, dy = m.py + TILE_SIZE/2 - p.gfx.y;
          if (dx*dx + dy*dy < (TILE_SIZE*0.55)*(TILE_SIZE*0.55)) {
            p.hitIds.add(uid);
            applyDamageToMonster(m, p.damage);
          }
        }
      }
      if (t >= 1) {
        if (p.targetId !== undefined && p.onHit) {
          const target = monsters.find(m => (m as unknown as { __uid: number }).__uid === p.targetId && !m.dead);
          if (target) p.onHit(target);
        }
        if (p.onArrive) p.onArrive();
        fxLayer.removeChild(p.gfx); p.gfx.destroy();
        projectiles.splice(i, 1);
      }
    }

    for (let i = fxParticles.length - 1; i >= 0; i--) {
      const p = fxParticles[i];
      const age = now - p.born;
      const t = age / p.life;
      if (t >= 1) { fxLayer.removeChild(p.gfx); p.gfx.destroy(); fxParticles.splice(i, 1); continue; }
      p.gfx.x += p.vx * (dt / 1000);
      p.gfx.y += p.vy * (dt / 1000);
      p.vy += p.gravity * (dt / 1000);
      p.gfx.alpha = p.alphaFrom * (1 - t);
      const s = p.scaleFrom + (p.scaleTo - p.scaleFrom) * t;
      p.gfx.scale.set(s);
    }

    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.life -= dt;
      f.text.y += f.vy * dt;
      f.text.alpha = Math.max(0, f.life / 700);
      if (f.life <= 0) { overlayLayer.removeChild(f.text); f.text.destroy(); floaters.splice(i, 1); }
    }

    const viewW = app.renderer.width, viewH = app.renderer.height;
    world.x = viewW / 2 - player.px * RENDER_SCALE - (TILE_SIZE * RENDER_SCALE) / 2;
    world.y = viewH / 2 - player.py * RENDER_SCALE - (TILE_SIZE * RENDER_SCALE) / 2;
    world.x = Math.round(world.x);
    world.y = Math.round(world.y);
  };
  app.ticker.add(tickFn);

  // Periodic UI refresh so cooldown bars animate.
  const uiInterval = setInterval(() => notifyUi(), 100);

  notifyUi();

  return {
    destroy() {
      clearInterval(uiInterval);
      app.ticker.remove(tickFn);
      app.destroy(true, { children: true, texture: true });
    },
    setInput(dir) { inputDir = dir; },
    attack() { wantAttack = true; },
    setClass,
    heal() { tryHeal(performance.now()); },
    teleport(mapId: string) {
      loadMapById(mapId);
      log("Você se teletransporta.");
    },
    useAbility(i) { useAbility(i); },
    buyAbility(id) { buyAbility(id); },
    equipAbility(slot, id) { equipAbility(slot, id); },
    equipItem(uid) { equipItem(uid); },
    unequipItem(slot) { unequipItem(slot); },
    discardItem(uid) { discardItem(uid); },
    upgradeEquipped(slot) { return upgradeEquipped(slot); },
    onUiChange(cb) {
      uiSubs.push(cb);
      cb(snapshot());
    },
    onForgeOpen(cb) { forgeOpenSubs.push(cb); },
  };
}
