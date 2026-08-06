/**
 * Omikuji prophecy oracle — combinatorial library of 1e15 unique slips.
 * Domains: design, daily life, career, love, weather, money, wellbeing,
 * travel, creativity, people, digital, home.
 *
 * Draws walk a cursor through the library (persisted). When a generation
 * is exhausted, the library expands automatically with a new generation.
 *
 * Copy is written in plain language so anyone can understand the advice.
 */

export const PROPHECY_CAPACITY = 1_000_000_000_000_000n; // 10^15

const RANKS = [
  { rank: "大吉", rankEn: "Great Luck" },
  { rank: "吉", rankEn: "Good Luck" },
  { rank: "中吉", rankEn: "Fair Luck" },
  { rank: "小吉", rankEn: "Small Luck" },
  { rank: "末吉", rankEn: "Luck Ahead" },
  { rank: "凶", rankEn: "Be Careful" },
];

const REALMS = [
  "design",
  "life",
  "career",
  "love",
  "weather",
  "money",
  "health",
  "travel",
  "creative",
  "social",
  "tech",
  "home",
];

/** Title fragments — combined as "Lead + Tail" */
const TITLE_LEADS = [
  "Bold", "Quiet", "Sudden", "Gentle", "Hidden", "Bright", "Patient", "Lucky",
  "Careful", "Clear", "Warm", "Sharp", "Soft", "Honest", "Brave", "Slow",
  "Quick", "Kind", "Strange", "Familiar", "Golden", "Silver", "Morning", "Night",
  "Seasonal", "Unseen", "Returning", "Opening", "Closing", "Rising", "Settling", "Wild",
  "Tender", "Practical", "Playful", "Serious", "Steady", "Sunny", "Stormy", "Calm",
  "Distant", "Near", "New", "Old", "Fresh", "Deep", "Light", "Heavy",
  "True", "Rare", "Simple", "Secret", "Public", "Private", "Design", "Career",
  "Heart", "Sky", "Home", "Road", "Work", "Rest",
];

const TITLE_TAILS = [
  "days ahead", "progress returns", "limits help", "clarity arrives",
  "space matters", "path opens", "tide turns", "wind shifts",
  "work finds rhythm", "love softens", "luck leans in", "timing lines up",
  "idea gets sharper", "patience pays off", "risk is useful", "rest is due",
  "focus deepens", "door unlocks", "signal gets stronger", "noise fades",
  "color finds you", "type settles", "brief gets clearer", "deadline teaches",
  "talk heals things", "apology works", "invite comes", "goodbye frees you",
  "rain arrives", "sun returns", "fog lifts", "heat breaks",
  "budget breathes", "offer appears", "debt lightens", "gift is coming",
  "body needs rest", "energy returns", "sleep helps", "hunger for life",
  "trip calls", "detour helps", "map updates", "homecoming nears",
  "sketch wins", "rough draft speaks", "people listen", "feedback lands kindly",
  "friendship mends", "boundary holds", "trust rebuilds", "laughter returns",
  "system gets simpler", "bug shows the truth", "update can wait", "offline helps",
  "room feels open", "table gathers people", "kitchen warms", "doorway welcomes",
];

const OPENERS = {
  design: [
    "A strong layout idea will show up this week.",
    "Leaving more empty space will make your work look better.",
    "Working with fewer options will make the idea clearer.",
    "The brief already hides a simpler answer.",
    "Your eye is ahead of the current design.",
    "A quieter font choice will say more.",
    "The grid needs one intentional break.",
    "Use color as a highlight, not everywhere.",
    "A better crop can save a weak image.",
    "Motion should explain something, not just look fancy.",
  ],
  life: [
    "A normal hour today can still feel special if you slow down.",
    "One small routine will steady your whole week.",
    "Someone’s kindness will land closer than you expect.",
    "A boring errand may turn into a tiny adventure.",
    "It’s okay to move at a human pace today.",
    "Finishing a forgotten chore will feel surprisingly good.",
    "This afternoon needs less pressure and more presence.",
    "A simple meal will taste like care.",
    "The day rewards the thing you almost put off.",
    "A short walk will rearrange your thoughts.",
  ],
  career: [
    "One useful conversation can change your week.",
    "Your work is being noticed, even when you’re not in the room.",
    "A work limit will push you toward a smarter idea.",
    "The next step is smaller than your fear makes it feel.",
    "An honest update beats waiting for a perfect one.",
    "Working with someone else unlocks what you can’t do alone.",
    "A quiet skill of yours is the missing piece.",
    "Saying no to the wrong thing protects the right yes.",
    "Advice will arrive right when you need it.",
    "Shipping something imperfect today beats polishing forever.",
  ],
  love: [
    "Kindness goes farther than being clever.",
    "A sincere message can soften a hard moment.",
    "Love shows up in practical ways this week.",
    "Listening will help more than explaining.",
    "A shared laugh repairs more than a long speech.",
    "Being there matters more than performing care.",
    "Honesty matters more than intensity right now.",
    "A clear boundary, said kindly, builds trust.",
    "Someone hopes you’ll take the first gentle step.",
    "Getting close again starts with one honest sentence.",
  ],
  weather: [
    "The sky’s mood may match yours today.",
    "A weather change will nudge your plans in a better direction.",
    "Rain is permission to slow down.",
    "Clear light favors clear decisions.",
    "Wind will clear some mental fog you’ve been carrying.",
    "Heavy air means softer expectations today.",
    "A cool morning will bring your appetite for work back.",
    "Cloudy weather makes the day feel cinematic — use it.",
    "Sunset is a good time for an outdoor talk.",
    "The forecast includes an unexpected stretch of calm.",
  ],
  money: [
    "A careful choice today protects next month’s ease.",
    "You’ll gain value by stopping what drains your attention.",
    "A little time invested now will pay off more than you think.",
    "You can be generous and careful in the same week.",
    "An unused subscription is ready to be cancelled.",
    "The best purchase is the one that removes daily hassle.",
    "Money follows clear thinking more than hustle this week.",
    "A fair deal is closer than you think.",
    "Count what already works before chasing more.",
    "Waiting to spend will make the choice wiser.",
  ],
  health: [
    "Drink water before you reach for more caffeine.",
    "Sleep will solve a problem pushing harder won’t.",
    "A stretch between tasks can prevent a bigger ache later.",
    "Breathing slower improves every decision.",
    "Food made with attention is already a kind of care.",
    "Rest counts as progress when you choose it on purpose.",
    "An hour away from screens will clear your head.",
    "Moving outside will reset your stress level.",
    "Being gentler with yourself will give you more stamina.",
    "Listen to your body early — don’t wait for a crash.",
  ],
  travel: [
    "A short detour will become the memorable part.",
    "Pack lighter and bring more curiosity.",
    "A stranger’s directions will turn out oddly perfect.",
    "Maps help, but looking up helps more.",
    "A delay may put you in the right place anyway.",
    "A local habit teaches more than a tourist checklist.",
    "Home will feel clearer after a change of street.",
    "The ticket you’re hesitating on is the right one.",
    "Pack one less thing and one more question.",
    "Arrival feels softer if you leave room for wonder.",
  ],
  creative: [
    "The rough first version already holds the heart of the final.",
    "Make three versions — the second will surprise you.",
    "Your taste comes back when you stop collecting references.",
    "A limit can spark better ideas than total freedom.",
    "Play before you polish — seriousness can wait an hour.",
    "The idea needs a smaller stage and a braver heart.",
    "Creativity likes unfinished mornings.",
    "Delete one clever bit; keep one true bit.",
    "One sketchbook page today can unstick the whole week.",
    "Inspiration prefers doing over mood-boarding.",
  ],
  social: [
    "A short check-in matters more than a long silence.",
    "Someone needs your normal presence, not a performance.",
    "Introduce two people — good luck travels through introductions.",
    "A specific compliment becomes something people keep.",
    "Skip one draining invite; say yes to one that feeds you.",
    "Community grows around making things together, not complaining.",
    "An old friend is one message away from warmth.",
    "Gossip steals energy you need for real talk.",
    "Hospitality can be a cup of tea and full attention.",
    "Your name is being spoken kindly nearby.",
  ],
  tech: [
    "A simpler workflow beats a shinier tool.",
    "Time offline will improve your online judgment.",
    "The bug is teaching you how the system really works.",
    "Automate the boring parts; handcraft the meaningful ones.",
    "Turning off notifications will free up creative energy.",
    "A rename and a cleanup now prevent future chaos.",
    "Ship a thin first version and learn from real use.",
    "Notes for future you are a kindness, not busywork.",
    "The right default setting saves a hundred later decisions.",
    "Good tech should disappear into usefulness.",
  ],
  home: [
    "Clearing one surface will calm the whole room.",
    "Light through a window is a free redesign.",
    "Water a plant — it will improve your mood too.",
    "The table wants conversation more than perfection.",
    "A scent or song can settle a restless mind.",
    "Fixing one small thing restores a larger sense of order.",
    "Guests feel the care you put into quiet corners.",
    "Night lighting should be softer than daytime ambition.",
    "A small end-of-work ritual helps you leave work at work.",
    "Home improves when you treat yourself like a welcome guest.",
  ],
};

const MIDDLES = [
  "Trust your first honest impulse — then improve it patiently.",
  "Leave room for your eyes, your heart, or your day to rest.",
  "One clear priority beats five half-finished plans.",
  "A small detail will matter more than a big showy move.",
  "Step away once; the answer often meets you halfway.",
  "Don’t polish a weak base. Start again with honesty.",
  "Finish the quiet work other people overlook.",
  "Taking something away will reveal the shape you needed.",
  "Try one unexpected choice and stick with it long enough to learn.",
  "Lead with meaning, then keep the styling light.",
  "If it feels crowded, it is — remove one extra thing.",
  "Test your idea in the smallest form first.",
  "Turn your taste into simple rules others can approve.",
  "Say it out loud, print it, or walk with it — the flaw will show.",
  "Tighten it until it still works in a small space.",
  "Share the rough version before it feels ready.",
  "Check the pacing twice; rushing hides uneven spots.",
  "Be strict with clutter and generous with breathing room.",
  "Make the quiet parts quieter and the important parts braver.",
  "Defend your direction with one clear reason.",
  "Use emphasis like punctuation, not decoration everywhere.",
  "Build a quick test before the moodboard gets longer.",
  "Protect empty space — it’s doing real work.",
  "Choose and commit; almost-deciding drains courage.",
  "Rename the goal in one honest sentence, then build from that.",
  "Let the ending get as much care as the opening.",
  "Push contrast further apart where the hierarchy feels weak.",
  "Name things like a human; future-you is listening.",
  "Add one useful risk if everything feels too safe.",
  "Break the pattern once, on purpose.",
  "Strengthen the idea before decorating the surface.",
  "Where you stumble saying it, rewrite the line.",
  "Calm often feels more premium than spectacle.",
  "Stop collecting. Make something from what you already know.",
  "Let personality ride on craft, not costume.",
  "Design the quiet moments with as much care as the climax.",
  "Promote what already works earlier than you think.",
  "Then stop. Overworking is vanity in disguise.",
  "Ask what must be felt first — build only that feeling.",
  "Design for the real limit, not the fantasy one.",
  "Match the details until the whole feels inevitable.",
  "Keep one main action and mean it.",
  "Get the structure right first; decoration is a reward.",
  "Double the air and cut the noise in half.",
  "Crop the ego out of the frame.",
  "Time the reveal kindly — good moments need pacing.",
  "Love the smallest unit and the system will scale.",
  "Doubt is useful until you decide; then move.",
  "Make something you would keep on your own desk.",
  "Work with the day’s mood instead of fighting it.",
  "Say the caring thing sooner than pride prefers.",
  "Money follows attention — spend both where it matters.",
  "Rest is part of the craft, not a failure of drive.",
  "Ask for help a little earlier than usual.",
  "A boundary today prevents resentment tomorrow.",
  "Write the message warm, then shorten it.",
  "Look up from the screen — the real scene is next to you.",
  "Luck prefers people already in motion.",
  "Keep the promise you made to yourself at breakfast.",
  "Leave one slot empty for unexpected kindness.",
];

const CLOSERS = [
  "Do one small thing about this before tonight.",
  "Wait until tomorrow morning if you need a clearer head.",
  "Hold this lightly — forcing it will spoil the luck.",
  "Don’t tell anyone until you’ve taken the first step.",
  "Tell one trusted person, then begin.",
  "Mark it with a small ritual — tea, a walk, or a sketch.",
  "If you feel cautious, slow down, don’t stop.",
  "If this feels lucky, don’t waste it on hesitation.",
  "Come back to this advice when doubt gets loud.",
  "Fortune grows when you use it, not when you wait.",
  "Let the day prove it in ordinary ways.",
  "One kept promise unlocks the rest.",
  "Watch for a sign in a conversation, the weather, or the timing.",
  "The machine rarely repeats itself — neither should you.",
  "Say thanks, then take one practical next step.",
  "Even a warning is a map, not a wall.",
  "Great luck still asks for good manners.",
  "Small luck becomes large when you repeat it kindly.",
  "Keep your hands busy and your judgment soft.",
  "End the day with one honest line in a notebook.",
  "Let coincidence confirm what courage already knows.",
  "Trade urgency for accuracy once, then move.",
  "Keep this near your craft, not your worry.",
  "A quiet thank-you completes the circle.",
  "Do the next kind thing before the big thing.",
  "This slip is temporary; the habit is the real fortune.",
  "Skip the drama; keep the discipline.",
  "Meet the day on foot before you meet it on a screen.",
  "If this is about love, choose warmth over winning.",
  "If this is about work, choose clarity over speed.",
  "If this is about weather, dress for change and smile.",
  "If this is about money, spend attention before cash.",
  "If this is about home, tidy one corner and breathe.",
  "If this is about travel, leave room in the bag for wonder.",
  "If this is about health, start by drinking water.",
  "If this is about design, delete one extra flourish today.",
  "Use this advice in the next hour only.",
  "Modest boldness is approved.",
  "Luck prefers clean desks and open windows.",
  "Start before the mood arrives.",
];

const TIMES = [
  "before noon", "after dusk", "this evening", "near midnight", "at first light",
  "before the next meal", "after one deep breath", "within three songs", "before you scroll again",
  "after a glass of water", "on the next clear morning", "before deadline panic hits",
  "during the commute", "in the quiet after lunch", "before you reply", "after you stretch",
  "while the kettle boils", "before the meeting starts", "after you step outside",
  "before sleep", "as the light changes", "when the rain starts", "when the rain stops",
  "before you spend", "after you save one thing", "before you say yes", "before you say no",
  "after you write it down", "before the second coffee", "when the room is empty",
  "while walking one block", "after you tidy a surface", "before opening another tab",
  "when someone asks how you are", "after you put the phone face down",
  "before weekend plans harden", "midweek", "as Friday softens", "on a slow Sunday",
  "during golden hour", "under cloudy skies", "in harsh noon light", "by lamplight",
  "before you redesign", "after the first round of feedback", "before the final export",
  "when the brief feels fuzzy", "after you rename the file honestly",
  "before you chase a new tool", "after you finish the ugly draft",
  "when love feels loud", "when love feels quiet", "after an honest apology",
  "before pride answers", "when the forecast flips", "after the wind settles",
  "before you book the ticket", "after you unpack one bag", "when home feels stale",
  "after you open a window", "before the invoice", "after the thank-you note",
  "when your body asks for rest", "after twenty minutes outside",
];

const VERBS = [
  "notice", "protect", "simplify", "sharpen", "soften", "finish", "begin", "pause",
  "ask about", "offer", "listen to", "ship", "sketch", "revise", "cut back", "commit to",
  "forgive", "invite", "decline", "repair", "plant", "water", "walk past", "stretch near",
  "save", "spend carefully on", "rename", "reorder", "reframe", "rest beside", "celebrate",
  "write down", "test", "present", "practice", "prepare", "pack lighter for", "arrive early for",
  "leave room around", "make tea near", "open", "close the extra tabs around", "call someone about",
  "write", "crop", "space less tightly", "contrast more in", "breathe slower around",
  "trust", "check on mobile", "print", "share", "let go of",
  "keep", "send", "set", "cook something simple for",
  "check", "change", "choose a calmer seat for", "appreciate",
];

const OBJECTS = [
  "the margin", "the headline", "the brief", "the color palette", "the prototype", "the inbox",
  "the apology", "the invitation", "the boundary", "the budget", "the forecast", "the travel plan",
  "the sketch", "the deadline", "the compliment", "the feedback", "the playlist", "the commute",
  "the kitchen table", "the open window", "the water glass", "your sleep schedule", "the side project",
  "the client call", "the first frame", "the last slide", "the unused subscription", "the old draft",
  "the new habit", "the quiet hour", "the loud opinion", "the soft landing", "the hard yes",
  "the kind no", "the shared meal", "the short walk", "the long edit", "the unread chapter",
  "the planted seed", "the mended seam", "the renamed layer", "the cleaner desk", "the truer sentence",
  "the braver crop", "the smaller scope", "the warmer light", "the cooler head", "the next ship date",
  "the weather app", "the packed bag", "the empty chair", "the handwritten note", "the calendar block",
  "the group chat", "the solo focus block", "your body of work", "one unfinished piece",
  "the daily stretch", "the weekly review", "the monthly reset", "the yearly wish",
  "the design system", "the love letter", "the career conversation", "the home ritual",
];

const MOODS = [
  "with patience", "with courage", "with softness", "with care", "without drama",
  "without apologizing for resting", "like a director", "like a beginner again", "like you mean it",
  "as if luck is watching", "as if no one is watching", "with one clear intention",
  "with humor", "with dignity", "with curiosity", "with less hurry", "with more breathing room",
  "in full color", "in honest black and white", "under kinder light", "against the default",
  "toward simplicity", "toward warmth", "toward usefulness", "toward delight",
  "before doubt takes over", "after gratitude lands", "between two deep breaths",
  "for the person you are becoming", "for the work you respect", "for the people you love",
  "for the body that carries you", "for the room you live in", "for the sky overhead",
  "as craft, not performance", "as care, not control", "as play, not pressure",
  "quietly", "boldly", "briefly", "thoroughly", "gently", "decisively",
  "with clean hands and a clear desk", "with wet ink and an open window",
];

/** Extra seasoning when a generation expands past the first library. */
const ERA_NOTES = [
  "",
  "A deeper shelf of the archive opens.",
  "The fortune box refills with new slips.",
  "Another wave of fortunes wakes up.",
  "The guardians approve an expanded library.",
  "Fresh slips fall into the chute.",
];

const STORAGE_CURSOR = "omikuji-prophecy-cursor-v2";
const STORAGE_GEN = "omikuji-prophecy-gen-v2";
const STORAGE_USED_EXTRAS = "omikuji-prophecy-extras-v2";

function modIndex(value, length) {
  if (length <= 0) return 0;
  const n = Number(value % BigInt(length));
  return n < 0 ? n + length : n;
}

function pick(list, index) {
  return list[modIndex(index, list.length)];
}

function scramble(index, generation) {
  // Mix generation so each expanded library feels newly shuffled.
  const golden = 0x9e3779b97f4a7c15n;
  let x = index + BigInt(generation) * golden;
  x ^= x >> 30n;
  x = (x * 0xbf58476d1ce4e5b9n) & ((1n << 62n) - 1n);
  x ^= x >> 27n;
  x = (x * 0x94d049bb133111ebn) & ((1n << 62n) - 1n);
  x ^= x >> 31n;
  return x;
}

function buildFromIndex(index, generation) {
  let x = scramble(index, generation);

  const rank = pick(RANKS, x);
  x /= BigInt(RANKS.length);

  const realm = pick(REALMS, x);
  x /= BigInt(REALMS.length);

  const lead = pick(TITLE_LEADS, x);
  x /= BigInt(TITLE_LEADS.length);

  const tail = pick(TITLE_TAILS, x);
  x /= BigInt(TITLE_TAILS.length);

  const openers = OPENERS[realm] || OPENERS.life;
  const opener = pick(openers, x);
  x /= BigInt(openers.length);

  const middle = pick(MIDDLES, x);
  x /= BigInt(MIDDLES.length);

  const closer = pick(CLOSERS, x);
  x /= BigInt(CLOSERS.length);

  const time = pick(TIMES, x);
  x /= BigInt(TIMES.length);

  const verb = pick(VERBS, x);
  x /= BigInt(VERBS.length);

  const object = pick(OBJECTS, x);
  x /= BigInt(OBJECTS.length);

  const mood = pick(MOODS, x);
  x /= BigInt(MOODS.length);

  const era = ERA_NOTES[(generation - 1) % ERA_NOTES.length];
  const title = `${lead} ${tail}`;
  const action = `Then ${verb} ${object} ${time}, ${mood}.`;
  const body = era
    ? `${opener} ${middle} ${action} ${closer} ${era}`
    : `${opener} ${middle} ${action} ${closer}`;

  return {
    id: `${generation}:${index.toString()}`,
    realm,
    rank: rank.rank,
    rankEn: rank.rankEn,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    body,
  };
}

function readBig(key, fallback = 0n) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === "") return fallback;
    return BigInt(raw);
  } catch {
    return fallback;
  }
}

function readNumber(key, fallback = 1) {
  try {
    const raw = localStorage.getItem(key);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* private mode / quota — still works in-memory for the session */
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Theoretical unique combinations before generation expand
 * (ranks × realms × titles × openers-avg × middles × closers) ≫ 1e15.
 * We expose a fixed 1e15 window per generation, then auto-expand.
 */
export function estimateCombinationSpace() {
  const openerAvg =
    Object.values(OPENERS).reduce((sum, list) => sum + list.length, 0) /
    REALMS.length;
  return (
    RANKS.length *
    REALMS.length *
    TITLE_LEADS.length *
    TITLE_TAILS.length *
    openerAvg *
    MIDDLES.length *
    CLOSERS.length *
    TIMES.length *
    VERBS.length *
    OBJECTS.length *
    MOODS.length
  );
}

/**
 * @param {{ extras?: Array<{rank?:string,rankEn?:string,title?:string,body?:string}> }} [options]
 */
export function createProphecyOracle(options = {}) {
  const extras = Array.isArray(options.extras) ? options.extras.filter(Boolean) : [];

  let cursor = readBig(STORAGE_CURSOR, 0n);
  let generation = readNumber(STORAGE_GEN, 1);
  let usedExtras = new Set(readJson(STORAGE_USED_EXTRAS, []));

  function persist() {
    write(STORAGE_CURSOR, cursor);
    write(STORAGE_GEN, generation);
    try {
      localStorage.setItem(STORAGE_USED_EXTRAS, JSON.stringify([...usedExtras]));
    } catch {
      /* ignore */
    }
  }

  function expandLibrary() {
    generation += 1;
    cursor = 0n;
    persist();
  }

  function drawExtra() {
    for (let i = 0; i < extras.length; i += 1) {
      const key = `extra:${i}:${extras[i].title || ""}:${extras[i].body || ""}`;
      if (usedExtras.has(key)) continue;
      usedExtras.add(key);
      persist();
      const item = extras[i];
      return {
        id: key,
        realm: "custom",
        rank: item.rank || "吉",
        rankEn: item.rankEn || "Good Luck",
        title: item.title || "A custom fortune",
        body: item.body || "",
      };
    }
    return null;
  }

  function draw() {
    const fromExtra = drawExtra();
    if (fromExtra) return fromExtra;

    if (cursor >= PROPHECY_CAPACITY) {
      expandLibrary();
    }

    const fortune = buildFromIndex(cursor, generation);
    cursor += 1n;
    persist();
    return fortune;
  }

  return {
    draw,
    get cursor() {
      return cursor;
    },
    get generation() {
      return generation;
    },
    get capacity() {
      return PROPHECY_CAPACITY;
    },
    expandLibrary,
  };
}
