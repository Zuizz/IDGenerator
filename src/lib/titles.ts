const FUN_TITLES = [
  "Chief Shipper & Voidwalker",
  "10x Smart Contract Wizard",
  "Vibes & Frontend Architect",
  "Professional Yak Shaver",
  "Bug Whisperer Extraordinaire",
  "Midnight Deploy Specialist",
  "Chaos Monkey Tamer",
  "Stack Overflow Sommelier",
  "Pixel-Perfect Perfectionist",
  "Full-Stack Alchemist",
  "Caffeine-Driven Developer",
  "Git Rebase Survivor",
  "API Wrangler Supreme",
  "Rubber Duck Consultant",
  "Production Fire Juggler",
  "Open Source Evangelist",
  "Senior Semicolon Inspector",
  "Blockchain Beach Builder",
  "AI Prompt Surfer",
  "Zero-to-One Speedrunner",
  "TypeScript Maximalist",
  "Serverless Sandcastle Builder",
  "The Debugger of Goa",
  "Low-Latency Legend",
];

let lastIndex = -1;

export function getRandomTitle(): string {
  let index: number;
  do {
    index = Math.floor(Math.random() * FUN_TITLES.length);
  } while (index === lastIndex && FUN_TITLES.length > 1);
  lastIndex = index;
  return FUN_TITLES[index];
}

export { FUN_TITLES };
