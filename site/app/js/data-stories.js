/* Bedtime stories. Each page: t = text, fx = sound effects.
   fx item: "name" plays when the page starts; {s:"name", on:"word"} plays when the narrator reaches that word.
   img: which of the story's two illustrations to show (0 or 1). amb: background ambience. */
window.STORIES = [
  {
    id: "pip-star", title: "Pip the Little Star", kind: "short", amb: "night", mins: 3,
    moral: "Even a small light can make a big difference.",
    pages: [
      { img: 0, t: "High up in the night sky lived a tiny star called Pip. Pip was the smallest star of all.", fx: ["sparkle"] },
      { img: 0, t: "\"I am too small to matter,\" Pip sighed. \"My light is only a little twinkle.\"", fx: ["wind"] },
      { img: 0, t: "Down below, a baby owl was lost in the dark woods. Hoo, hoo! Which way is home?", fx: [{ s: "owl", on: "Hoo" }] },
      { img: 1, t: "Pip took a big breath and shone as bright as she could. Twinkle, twinkle, sparkle!", fx: [{ s: "magic", on: "Twinkle" }] },
      { img: 1, t: "The baby owl saw the light and flew all the way home to his warm, cosy nest.", fx: [{ s: "whoosh", on: "flew" }] },
      { img: 1, t: "Pip smiled. Even a small light can help someone find their way. Goodnight, Pip.", fx: [{ s: "chime", on: "Goodnight" }] }
    ]
  },
  {
    id: "benny-sorry", title: "Benny Bear Says Sorry", kind: "short", amb: "forest", mins: 3,
    moral: "Saying sorry helps mend hurt feelings.",
    pages: [
      { img: 0, t: "Benny Bear was building a tall tower of blocks with his best friend, Rosie Rabbit.", fx: ["blocks"] },
      { img: 0, t: "Rosie put one more block on the very top. Crash! The whole tower fell down.", fx: [{ s: "crash", on: "Crash" }] },
      { img: 0, t: "\"You knocked it down!\" Benny shouted. He stomped his feet. Stomp, stomp, stomp!", fx: [{ s: "stomp", on: "Stomp" }] },
      { img: 1, t: "Rosie's ears drooped and a little tear rolled down her cheek. Benny felt a funny ache in his tummy.", fx: ["sad"] },
      { img: 1, t: "Benny took a deep breath. \"I'm sorry I shouted, Rosie. Let's build it again, together.\"", fx: [{ s: "chime", on: "sorry" }] },
      { img: 1, t: "They built the tallest tower ever. Saying sorry made their friendship even stronger.", fx: [{ s: "cheer", on: "tallest" }] }
    ]
  },
  {
    id: "kind-cloud", title: "The Kind Little Cloud", kind: "short", amb: "birds", mins: 3,
    moral: "When we help others, we feel happy too.",
    pages: [
      { img: 0, t: "Cleo was a fluffy little cloud who loved to float over the green hills.", fx: ["wind"] },
      { img: 0, t: "Down below, the flowers were droopy and the ground was dry. \"We are so thirsty,\" they whispered.", fx: ["sad"] },
      { img: 0, t: "Cleo wanted to help. She squeezed and squeezed until, pitter patter, down came the rain!", fx: [{ s: "rain", on: "pitter" }] },
      { img: 1, t: "The flowers drank and drank. They lifted their heads and opened their petals wide.", fx: [{ s: "sparkle", on: "opened" }] },
      { img: 1, t: "Cleo was smaller now, but her heart felt big and warm.", fx: ["chime"] },
      { img: 1, t: "Then the sun came out and painted a rainbow, just for Cleo. Kindness always comes back to you.", fx: [{ s: "magic", on: "rainbow" }] }
    ]
  },
  {
    id: "milo-share", title: "Milo Mouse Shares", kind: "short", amb: "home", mins: 3,
    moral: "Sharing makes everyone happier.",
    pages: [
      { img: 0, t: "Milo Mouse found a big, round cheese. \"All mine!\" he squeaked.", fx: [{ s: "squeak", on: "squeaked" }] },
      { img: 0, t: "He nibbled and nibbled. Munch, munch, munch. But eating alone felt a little bit lonely.", fx: [{ s: "munch", on: "Munch" }] },
      { img: 0, t: "Knock, knock! It was his friends, Hattie Hedgehog and Sid Squirrel. Their tummies rumbled.", fx: [{ s: "knock", on: "Knock" }] },
      { img: 1, t: "Milo looked at his big cheese. Then he smiled. \"There is plenty for everyone!\"", fx: [{ s: "pop", on: "plenty" }] },
      { img: 1, t: "Hattie brought berries and Sid brought nuts. Soon they had a giant feast.", fx: [{ s: "cheer", on: "feast" }] },
      { img: 1, t: "Milo learned that sharing turns a little snack into a happy party.", fx: [{ s: "bell", on: "party" }] }
    ]
  },
  {
    id: "ollie-owl", title: "Ollie Owl Can't Sleep", kind: "short", amb: "night", mins: 3,
    moral: "Slow breaths and happy thoughts help us rest.",
    pages: [
      { img: 0, t: "Ollie Owl was snuggled in his tree, but his eyes were wide open. Blink, blink.", fx: [{ s: "pop", on: "Blink" }] },
      { img: 0, t: "\"I can't sleep, Mama,\" said Ollie. \"My head is too busy.\"", fx: ["owl"] },
      { img: 0, t: "\"Let's breathe like the wind,\" said Mama Owl. \"In through your nose, and out, slowly.\"", fx: [{ s: "wind", on: "slowly" }] },
      { img: 1, t: "\"Now think of three happy things.\" Ollie thought of berries, his friends, and a big warm hug.", fx: [{ s: "chime", on: "berries" }] },
      { img: 1, t: "His feathers felt heavy and soft. His eyes felt sleepy and slow.", fx: ["crickets"] },
      { img: 1, t: "Ollie gave a big yawn and drifted off to dreamland. Goodnight, Ollie. Goodnight, you.", fx: [{ s: "snore", on: "yawn" }] }
    ]
  },
  {
    id: "three-pigs", title: "The Three Little Pigs", kind: "fairy", amb: "farm", mins: 4,
    moral: "Hard work and doing things properly keeps us safe.",
    pages: [
      { img: 0, t: "Once upon a time, three little pigs set off to build houses of their own.", fx: ["footsteps"] },
      { img: 0, t: "The first pig built a house of straw. The second pig built a house of sticks. Then they ran off to play.", fx: [{ s: "pop", on: "straw" }, { s: "knock", on: "sticks" }] },
      { img: 0, t: "The third pig worked hard all day long. She built a strong house of bricks.", fx: [{ s: "hammer", on: "worked" }] },
      { img: 1, t: "Along came a hungry wolf. He huffed and he puffed, and he blew the straw and stick houses down!", fx: [{ s: "huff", on: "huffed" }, { s: "crash", on: "down" }] },
      { img: 1, t: "The two little pigs ran to the brick house. The wolf huffed and puffed, but the house stood strong.", fx: [{ s: "footsteps", on: "ran" }, { s: "huff", on: "huffed" }] },
      { img: 1, t: "The tired wolf gave up and ran away. The three pigs cheered. Hard work keeps us safe and strong.", fx: [{ s: "cheer", on: "cheered" }] }
    ]
  },
  {
    id: "tortoise-hare", title: "The Tortoise and the Hare", kind: "fairy", amb: "birds", mins: 4,
    moral: "Keep trying and never give up.",
    pages: [
      { img: 0, t: "Hare was very fast, and he loved to show off. \"Nobody can beat me!\" he laughed.", fx: ["whoosh"] },
      { img: 0, t: "\"I will race you,\" said Tortoise, slowly. All the animals gasped.", fx: [{ s: "gasp", on: "gasped" }] },
      { img: 0, t: "Ready, steady, go! Hare zoomed away. Tortoise plodded along, step by step.", fx: [{ s: "bell", on: "go" }, { s: "whoosh", on: "zoomed" }] },
      { img: 1, t: "Hare was so far ahead that he lay down under a tree for a little nap.", fx: [{ s: "snore", on: "nap" }] },
      { img: 1, t: "Tortoise kept going. Slow and steady, never stopping, right past the sleeping Hare.", fx: [{ s: "footsteps", on: "Slow" }] },
      { img: 1, t: "Hare woke up and ran, but it was too late. Tortoise had won! Slow and steady wins the race.", fx: [{ s: "cheer", on: "won" }] }
    ]
  },
  {
    id: "red-hen", title: "The Little Red Hen", kind: "fairy", amb: "farm", mins: 4,
    moral: "When everyone helps, everyone can share.",
    pages: [
      { img: 0, t: "The Little Red Hen found some grains of wheat. \"Who will help me plant it?\" she asked.", fx: ["cluck"] },
      { img: 0, t: "\"Not I,\" said the dog. \"Not I,\" said the cat. \"Not I,\" said the duck. So she planted it herself.", fx: [{ s: "woof", on: "dog" }, { s: "meow", on: "cat" }, { s: "quack", on: "duck" }] },
      { img: 0, t: "The wheat grew tall and golden. \"Who will help me cut it?\" \"Not I,\" said everyone.", fx: ["wind"] },
      { img: 1, t: "So she cut the wheat, ground the flour, and baked a lovely loaf of bread.", fx: [{ s: "bell", on: "baked" }] },
      { img: 1, t: "\"Who will help me eat the bread?\" \"I will!\" said the dog, the cat, and the duck.", fx: [{ s: "cluck", on: "Who" }] },
      { img: 1, t: "\"Next time, please help me,\" said the hen. And next time, they all did. Helping is the best way to share.", fx: [{ s: "cheer", on: "all" }] }
    ]
  },
  {
    id: "lion-mouse", title: "The Lion and the Mouse", kind: "fairy", amb: "forest", mins: 4,
    moral: "Nobody is too small to help.",
    pages: [
      { img: 0, t: "A mighty lion was sleeping in the warm sun. Snore, snore.", fx: [{ s: "snore", on: "Snore" }] },
      { img: 0, t: "A tiny mouse ran across his nose. The lion woke up and caught her in his big paw. Roar!", fx: [{ s: "roar", on: "Roar" }] },
      { img: 0, t: "\"Please let me go,\" squeaked the mouse. \"One day I will help you.\" The lion laughed, but he let her go.", fx: [{ s: "squeak", on: "squeaked" }] },
      { img: 1, t: "Days later, the lion was caught in a hunter's net. He roared and roared.", fx: [{ s: "roar", on: "roared" }] },
      { img: 1, t: "The little mouse heard him. Nibble, nibble, she chewed through the ropes. Snap!", fx: [{ s: "munch", on: "Nibble" }, { s: "snap", on: "Snap" }] },
      { img: 1, t: "The lion was free! \"Thank you, little friend.\" Nobody is too small to help.", fx: [{ s: "cheer", on: "free" }] }
    ]
  },
  {
    id: "cried-wolf", title: "The Boy Who Cried Wolf", kind: "fairy", amb: "farm", mins: 4,
    moral: "Always tell the truth, so people can trust you.",
    pages: [
      { img: 0, t: "A shepherd boy watched the sheep on the hill. Baa, baa. He was very bored.", fx: [{ s: "sheep", on: "Baa" }] },
      { img: 0, t: "For fun, he shouted, \"Wolf! Wolf!\" The villagers ran up the hill, but there was no wolf.", fx: [{ s: "footsteps", on: "ran" }] },
      { img: 0, t: "The boy laughed. The next day he did it again. The villagers were not happy at all.", fx: ["sad"] },
      { img: 1, t: "Then one evening, a real wolf came out of the trees! Awoooo!", fx: [{ s: "howl", on: "Awoooo" }] },
      { img: 1, t: "\"Wolf! Wolf!\" cried the boy. But nobody came. They thought he was joking again.", fx: ["wind"] },
      { img: 1, t: "The sheep ran safely away, but the boy learned a big lesson. Always tell the truth, so people can trust you.", fx: [{ s: "sheep", on: "sheep" }] }
    ]
  },
  {
    id: "goldilocks", title: "Goldilocks and the Three Bears", kind: "fairy", amb: "forest", mins: 4,
    moral: "Respect other people's things, and always ask first.",
    pages: [
      { img: 0, t: "Goldilocks was walking in the woods when she found a little cottage. Knock, knock. Nobody was home.", fx: [{ s: "knock", on: "Knock" }, { s: "creak", on: "Nobody" }] },
      { img: 0, t: "Inside were three bowls of porridge. Too hot! Too cold! This one is just right. Slurp!", fx: [{ s: "munch", on: "Slurp" }] },
      { img: 0, t: "She tried three chairs. Too big! Too big! Just right... crack! The little chair broke.", fx: [{ s: "crash", on: "crack" }] },
      { img: 1, t: "Upstairs were three beds. The smallest one was just right, and she fell fast asleep.", fx: [{ s: "snore", on: "asleep" }] },
      { img: 1, t: "The three bears came home. \"Someone's been eating my porridge!\" cried Baby Bear.", fx: [{ s: "stomp", on: "came" }, { s: "growl", on: "cried" }] },
      { img: 1, t: "Goldilocks woke up and said, \"I'm so sorry.\" She helped fix the chair. Always ask before you take.", fx: [{ s: "chime", on: "sorry" }] }
    ]
  },
  {
    id: "ugly-duckling", title: "The Ugly Duckling", kind: "fairy", amb: "water", mins: 4,
    moral: "Be kind to those who are different. Everyone is special.",
    pages: [
      { img: 0, t: "By a farm pond, a mother duck's eggs began to hatch. Crack, crack! Out came fluffy yellow ducklings.", fx: [{ s: "pop", on: "Crack" }, { s: "quack", on: "ducklings" }] },
      { img: 0, t: "The last egg was big. Out came a grey, gangly duckling. \"He looks different,\" the others said.", fx: [{ s: "pop", on: "Out" }] },
      { img: 0, t: "The little duckling felt sad and lonely. He swam far away across the pond.", fx: [{ s: "splash", on: "swam" }] },
      { img: 1, t: "All winter long he waited, cold and alone, by the frozen reeds.", fx: ["wind"] },
      { img: 1, t: "In spring, he saw his face in the water. He had grown into a beautiful white swan!", fx: [{ s: "magic", on: "beautiful" }] },
      { img: 1, t: "The other swans welcomed him home. Everyone is special in their own way.", fx: [{ s: "cheer", on: "welcomed" }] }
    ]
  }
  ,
  {
    id: "faris-falcon", title: "Faris the Little Falcon", kind: "short", amb: "desert", mins: 3,
    moral: "Practice and patience help us grow.",
    pages: [
      { img: 0, t: "High above the golden desert, Faris the little falcon watched the big birds soar.", fx: ["wind"] },
      { img: 0, t: "\"I want to fly like that!\" said Faris. He flapped his wings and, bump, he landed in the sand.", fx: [{ s: "flap", on: "flapped" }, { s: "thud", on: "bump" }] },
      { img: 0, t: "Faris felt cross. \"I will never fly,\" he said. But Grandpa Falcon smiled. \"Try again tomorrow.\"", fx: ["sad"] },
      { img: 1, t: "Every day Faris practised. Flap, flap, hop. Flap, flap, glide. A little higher each time.", fx: [{ s: "flap", on: "Flap" }] },
      { img: 1, t: "One morning, the warm wind lifted him up, up, up, over the dunes and the shining city.", fx: [{ s: "whoosh", on: "lifted" }] },
      { img: 1, t: "\"I'm flying!\" called Faris. Little by little, practice helps us grow.", fx: [{ s: "cheer", on: "flying" }] }
    ]
  },
  {
    id: "jamila-camel", title: "Jamila the Camel in a Hurry", kind: "short", amb: "desert", mins: 3,
    moral: "Slowing down helps us notice what matters.",
    pages: [
      { img: 0, t: "Jamila the camel was always in a hurry. Clip, clop, clip, clop, across the sand she ran.", fx: [{ s: "hooves", on: "Clip" }] },
      { img: 0, t: "\"Hurry, hurry!\" she said. She rushed past a lizard, a little fox, and a bright desert flower.", fx: ["whoosh"] },
      { img: 0, t: "Swish! Jamila was going so fast that she dropped her water bottle and did not even notice.", fx: [{ s: "pop", on: "Swish" }] },
      { img: 1, t: "Soon she was hot and thirsty. \"Oh no, where is my water?\"", fx: ["sad"] },
      { img: 1, t: "The little fox came trotting up. \"You dropped this!\" Jamila drank and said, \"Thank you, friend.\"", fx: [{ s: "splash", on: "drank" }] },
      { img: 1, t: "Now Jamila walks slowly. She waves to the lizard and smells the flowers. Slowing down is lovely.", fx: [{ s: "chime", on: "slowly" }] }
    ]
  },
  {
    id: "noor-lantern", title: "Noor and the Neighbours", kind: "short", amb: "home", mins: 3,
    moral: "Kindness makes a building feel like a family.",
    pages: [
      { img: 0, t: "Noor lived on the tenth floor of a tall building. Ding! went the lift, every single day.", fx: [{ s: "ding", on: "Ding" }] },
      { img: 0, t: "But Noor did not know her neighbours. \"Everybody is busy,\" she sighed.", fx: ["sad"] },
      { img: 0, t: "So Noor and her mama made a paper lantern for every door on their floor.", fx: [{ s: "snip", on: "paper" }] },
      { img: 1, t: "Knock, knock! \"Hello! This is for you,\" said Noor. Each neighbour smiled a big surprised smile.", fx: [{ s: "knock", on: "Knock" }] },
      { img: 1, t: "The next day, Mr Ravi brought mangoes, Mrs Sara brought dates, and little Leo brought a drawing.", fx: [{ s: "bell", on: "brought" }] },
      { img: 1, t: "Now the tenth floor glows with lanterns and friends. Kindness makes a building feel like a family.", fx: [{ s: "magic", on: "glows" }] }
    ]
  },
  {
    id: "turtle-beach", title: "Tala the Sea Turtle", kind: "short", amb: "water", mins: 3,
    moral: "We can all take care of our world.",
    pages: [
      { img: 0, t: "Tala the baby sea turtle lived in the warm, blue sea near the beach.", fx: ["splash"] },
      { img: 0, t: "One day she swam into something crinkly. It was a plastic bag! Tala was stuck.", fx: [{ s: "crinkle", on: "crinkly" }] },
      { img: 0, t: "On the beach, a girl called Mira saw her. Splash, splash! Mira and her dad helped Tala get free.", fx: [{ s: "splash", on: "Splash" }] },
      { img: 1, t: "\"Let's clean the beach,\" said Mira. Her friends came with buckets and gloves.", fx: [{ s: "footsteps", on: "came" }] },
      { img: 1, t: "They picked up bottles and bags until the sand sparkled.", fx: [{ s: "sparkle", on: "sparkled" }] },
      { img: 1, t: "Tala swam happy circles in the clean sea. We can all take care of our world.", fx: [{ s: "cheer", on: "happy" }] }
    ]
  },
  {
    id: "ant-grasshopper", title: "The Ant and the Grasshopper", kind: "fairy", amb: "birds", mins: 4,
    moral: "Work first, then play, and always be ready to share.",
    pages: [
      { img: 0, t: "All summer long, Grasshopper sang and danced in the sunshine. La, la, la!", fx: [{ s: "chirp", on: "sang" }] },
      { img: 0, t: "Little Ant worked hard. She carried seeds, one by one, to her home under the tree.", fx: ["footsteps"] },
      { img: 0, t: "\"Come and play!\" called Grasshopper. \"Not yet,\" said Ant. \"I'm getting ready for winter.\"", fx: [{ s: "chirp", on: "Come" }] },
      { img: 1, t: "Then winter came. It was cold and windy, and there was no food to find.", fx: ["wind"] },
      { img: 1, t: "Grasshopper knocked on Ant's door. Knock, knock. \"I'm so hungry,\" he said.", fx: [{ s: "knock", on: "Knock" }] },
      { img: 1, t: "Ant shared her seeds, and Grasshopper promised to help next summer. Work first, then play.", fx: [{ s: "chime", on: "shared" }] }
    ]
  },
  {
    id: "stone-soup", title: "Stone Soup", kind: "fairy", amb: "home", mins: 4,
    moral: "When everyone adds a little, there is plenty for all.",
    pages: [
      { img: 0, t: "A hungry traveller came to a village with only a pot and a smooth, round stone.", fx: ["footsteps"] },
      { img: 0, t: "He filled the pot with water and dropped in the stone. Plop! \"I'm making stone soup,\" he said.", fx: [{ s: "plop", on: "Plop" }] },
      { img: 0, t: "A curious girl peeked out. \"It would taste better with a carrot,\" said the traveller. She brought one.", fx: [{ s: "creak", on: "peeked" }] },
      { img: 1, t: "Then a boy brought onions. A grandma brought beans. A farmer brought potatoes.", fx: [{ s: "plop", on: "onions" }, { s: "plop", on: "beans" }] },
      { img: 1, t: "The soup bubbled and smelled delicious. Bubble, bubble, bubble!", fx: [{ s: "bubble", on: "bubbled" }] },
      { img: 1, t: "Everyone ate together and laughed. When everyone adds a little, there is plenty for all.", fx: [{ s: "cheer", on: "laughed" }] }
    ]
  },
  {
    id: "rabbit-lion", title: "The Clever Rabbit and the Lion", kind: "fairy", amb: "forest", mins: 4,
    moral: "Being clever and calm is stronger than being a bully.",
    pages: [
      { img: 0, t: "Long ago, a bossy lion ruled the forest. \"Bring me food every day!\" he roared.", fx: [{ s: "roar", on: "roared" }] },
      { img: 0, t: "The animals were scared. One day, it was little Rabbit's turn to go to the lion.", fx: ["sad"] },
      { img: 0, t: "Rabbit thought and thought. Then he had a clever idea. Ding!", fx: [{ s: "ding", on: "Ding" }] },
      { img: 1, t: "\"Lion, there is another lion in the old well,\" said Rabbit. \"He says he is the king!\"", fx: [{ s: "growl", on: "another" }] },
      { img: 1, t: "The lion looked into the well and saw his own face. He roared and jumped in. Splash!", fx: [{ s: "roar", on: "roared" }, { s: "splash", on: "Splash" }] },
      { img: 1, t: "He climbed out, wet and dripping, and promised to be kind. Being clever and calm beats being a bully.", fx: [{ s: "cheer", on: "promised" }] }
    ]
  },
  {
    id: "juha-donkey", title: "Juha and the Donkey", kind: "fairy", amb: "desert", mins: 4,
    moral: "You cannot please everyone, so be kind and think for yourself.",
    pages: [
      { img: 0, t: "Juha and his son walked to the market with their little donkey. Clip, clop, clip, clop.", fx: [{ s: "hooves", on: "Clip" }] },
      { img: 0, t: "\"How silly!\" said a man. \"Why does nobody ride the donkey?\" So Juha's son climbed on.", fx: [{ s: "heehaw", on: "donkey" }] },
      { img: 0, t: "\"How rude!\" said a lady. \"The boy rides while his father walks!\" So they swapped.", fx: ["pop"] },
      { img: 1, t: "\"Poor donkey!\" said a shopkeeper. So Juha and his son both tried to carry the donkey. Wobble, wobble!", fx: [{ s: "heehaw", on: "Poor" }, { s: "boing", on: "Wobble" }] },
      { img: 1, t: "Everybody laughed. Juha put the donkey down and smiled at his son.", fx: ["cheer"] },
      { img: 1, t: "\"You cannot please everyone,\" said Juha. \"So be kind, and think for yourself.\"", fx: [{ s: "chime", on: "think" }] }
    ]
  }
];
