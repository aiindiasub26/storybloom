/* Learn-to-read content. Ordered roughly by difficulty (ages 3 → 8). */

// Letter sounds. say = what the narrator says (sound, sound, word).
window.LETTERS = [
  { l: "a", word: "apple", pic: "apple", say: "ah... ah... apple" },
  { l: "b", word: "ball", pic: "ball", say: "buh... buh... ball" },
  { l: "c", word: "cat", pic: "cat", say: "kuh... kuh... cat" },
  { l: "d", word: "dog", pic: "dog", say: "duh... duh... dog" },
  { l: "e", word: "egg", pic: "egg", say: "eh... eh... egg" },
  { l: "f", word: "fish", pic: "fish", say: "fff... fff... fish" },
  { l: "g", word: "goat", pic: "goat", say: "guh... guh... goat" },
  { l: "h", word: "hat", pic: "hat", say: "hh... hh... hat" },
  { l: "i", word: "insect", pic: "insect", say: "ih... ih... insect" },
  { l: "j", word: "juice", pic: "juice", say: "juh... juh... juice" },
  { l: "k", word: "kite", pic: "kite", say: "kuh... kuh... kite" },
  { l: "l", word: "lion", pic: "lion", say: "lll... lll... lion" },
  { l: "m", word: "moon", pic: "moon", say: "mmm... mmm... moon" },
  { l: "n", word: "nose", pic: "nose", say: "nnn... nnn... nose" },
  { l: "o", word: "octopus", pic: "octopus", say: "aw... aw... octopus" },
  { l: "p", word: "pig", pic: "pig", say: "puh... puh... pig" },
  { l: "q", word: "queen", pic: "queen", say: "kwuh... kwuh... queen" },
  { l: "r", word: "rabbit", pic: "rabbit", say: "rrr... rrr... rabbit" },
  { l: "s", word: "sun", pic: "sun", say: "sss... sss... sun" },
  { l: "t", word: "tiger", pic: "tiger", say: "tuh... tuh... tiger" },
  { l: "u", word: "umbrella", pic: "umbrella", say: "uh... uh... umbrella" },
  { l: "v", word: "van", pic: "van", say: "vvv... vvv... van" },
  { l: "w", word: "watermelon", pic: "watermelon", say: "wuh... wuh... watermelon" },
  { l: "x", word: "fox", pic: "fox", say: "ks... ks... fox" },
  { l: "y", word: "yo-yo", pic: "yo-yo", say: "yuh... yuh... yo-yo" },
  { l: "z", word: "zebra", pic: "zebra", say: "zzz... zzz... zebra" }
];

// Picture-able CVC words for blending, spelling and matching games.
window.CVC = [
  { w: "cat", pic: "cat" }, { w: "bat", pic: "bat" }, { w: "hat", pic: "hat" }, { w: "rat", pic: "rat" },
  { w: "map", pic: "map" }, { w: "cap", pic: "cap" }, { w: "fan", pic: "fan" }, { w: "pan", pic: "pan" },
  { w: "van", pic: "van" }, { w: "bed", pic: "bed" }, { w: "hen", pic: "hen" }, { w: "pen", pic: "pen" },
  { w: "ten", pic: "ten" }, { w: "net", pic: "net" }, { w: "jet", pic: "jet" }, { w: "web", pic: "web" },
  { w: "pig", pic: "pig" }, { w: "zip", pic: "zip" }, { w: "lip", pic: "lip" }, { w: "six", pic: "six" },
  { w: "dog", pic: "dog" }, { w: "fox", pic: "fox" }, { w: "box", pic: "box" }, { w: "log", pic: "log" },
  { w: "pot", pic: "pot" }, { w: "bug", pic: "bug" }, { w: "mug", pic: "mug" }, { w: "hug", pic: "hug" },
  { w: "sun", pic: "sun" }, { w: "bun", pic: "bun" }, { w: "cup", pic: "cup" }, { w: "bus", pic: "bus" }
];

// Word families for rhyme time + printable word houses.
window.FAMILIES = {
  at: ["cat", "bat", "hat", "rat", "mat", "sat"],
  an: ["can", "fan", "man", "pan", "van", "ran"],
  en: ["hen", "pen", "ten", "men"],
  et: ["net", "jet", "wet", "pet"],
  ig: ["pig", "big", "dig", "wig"],
  og: ["dog", "log", "fog", "jog"],
  ot: ["pot", "hot", "dot", "cot"],
  ug: ["bug", "mug", "hug", "rug", "jug"],
  un: ["sun", "bun", "run", "fun"],
  ip: ["zip", "lip", "dip", "sip"]
};

// Sight words in four sets (Dolch pre-primer / primer).
window.SIGHT = [
  { name: "Set 1", color: "#f28b82", words: ["I", "a", "the", "see", "and", "is", "it", "to", "go", "me"] },
  { name: "Set 2", color: "#fbbc04", words: ["can", "we", "my", "you", "up", "in", "look", "he", "she", "said"] },
  { name: "Set 3", color: "#81c995", words: ["was", "are", "they", "here", "come", "play", "like", "have", "what", "with"] },
  { name: "Set 4", color: "#78d9ec", words: ["big", "little", "down", "all", "yes", "no", "good", "one", "two", "for"] }
];

// Leveled decodable readers for guided reading.
window.READERS = [
  {
    id: "cat-mat", title: "The Cat", level: 1, color: "#f6aea9",
    pages: ["I see a cat.", "The cat is fat.", "The cat can sit.", "The cat sat on a mat.", "Good cat!"],
    qs: [
      { q: "What did you see?", opts: ["a cat", "a dog", "a pig"], a: 0 },
      { q: "Where did the cat sit?", opts: ["on a mat", "on a bus", "in a box"], a: 0 }
    ]
  },
  {
    id: "big-dog", title: "Big Dog", level: 1, color: "#ffd479",
    pages: ["A big dog.", "The dog can run.", "Run, dog, run!", "The dog is hot.", "The dog naps in the sun."],
    qs: [
      { q: "What can the dog do?", opts: ["run", "fly", "swim"], a: 0 },
      { q: "Where does the dog nap?", opts: ["in the sun", "in a bed", "in the bath"], a: 0 }
    ]
  },
  {
    id: "red-bus", title: "The Red Bus", level: 2, color: "#a8dab5",
    pages: ["Ben got on the red bus.", "The bus went up the hill.", "Ben saw a pig and a hen.", "The bus stops at the top.", "Ben hops off. Fun!"],
    qs: [
      { q: "What colour was the bus?", opts: ["red", "blue", "green"], a: 0 },
      { q: "What did Ben see?", opts: ["a pig and a hen", "a cat and a dog", "a fox and a bug"], a: 0 }
    ]
  },
  {
    id: "sam-fish", title: "Sam and the Fish", level: 2, color: "#9fd8e8",
    pages: ["Sam has a net.", "Sam gets a fish.", "The fish is wet and sad.", "Sam lets the fish go.", "Swim, fish, swim!"],
    qs: [
      { q: "What did Sam get?", opts: ["a fish", "a frog", "a hat"], a: 0 },
      { q: "Why did Sam let the fish go?", opts: ["The fish was sad.", "The fish was big.", "Sam was hungry."], a: 0 }
    ]
  },
  {
    id: "rain-day", title: "Rain Day", level: 3, color: "#c7b8ea",
    pages: ["It is a rainy day.", "Tom puts on his red boots.", "He jumps in a big puddle. Splash!", "Tom gets very wet.", "He laughs and laughs. What fun!"],
    qs: [
      { q: "What did Tom put on?", opts: ["red boots", "a blue hat", "a big coat"], a: 0 },
      { q: "How did Tom feel?", opts: ["happy", "cross", "sleepy"], a: 0 }
    ]
  },
  {
    id: "picnic", title: "The Picnic", level: 3, color: "#f9c38c",
    pages: ["Mum and Kim pack a picnic.", "They have jam buns and milk.", "A little duck comes to look.", "Kim gives the duck a crumb.", "The duck is glad. So is Kim!"],
    qs: [
      { q: "Who came to look?", opts: ["a duck", "a dog", "a bee"], a: 0 },
      { q: "What did Kim do?", opts: ["She shared a crumb.", "She ran away.", "She went to sleep."], a: 0 }
    ]
  }
];

// Short spoken prompts used by the games (pre-recorded so they work offline).
window.PROMPTS = {
  welcome: "Hello, friend! What shall we do today?",
  tapWord: "Listen, and tap the word you hear.",
  firstSound: "Which picture starts with this sound?",
  rhyme: "Which one rhymes?",
  build: "Can you spell this word?",
  match: "Which word matches the picture?",
  blend: "Tap each sound, then blend them together.",
  great: "Great job!",
  wow: "Wow, super reading!",
  tryAgain: "Oops, try again!",
  yourTurn: "Your turn! Read it out loud.",
  sticker: "You earned a sticker!",
  trace: "Trace the letter with your finger.",
  goodnight: "Sweet dreams. Goodnight."
};
