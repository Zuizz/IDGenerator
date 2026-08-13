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

const STACK_TITLE_MAP: Record<string, string[]> = {
  react: [
    "Virtual DOM Alchemist",
    "Hook Whisperer Supreme",
    "JSX & Chill Specialist",
    "Hydration Hero",
    "Re-render Slayer",
  ],
  next: [
    "App Router Speedrunner",
    "Server Component Architect",
    "Edge Runtime Pioneer",
    "SSR Mastermind",
    "Static Site Wizard",
  ],
  typescript: [
    "Strict Type Maximalist",
    "Generics Magician",
    "Any-Type Exorcist",
    "Type Inference Ninja",
    "Interface Sorcerer",
  ],
  rust: [
    "Borrow Checker Boss",
    "Zero-Cost Abstractionist",
    "Unsafe Block Daredevil",
    "Memory Safety Sentinel",
    "Cargo Release Shipper",
  ],
  solidity: [
    "Gas Fee Destroyer",
    "10x Smart Contract Wizard",
    "EVM Bytecode Whisperer",
    "Reentrancy Shield Master",
    "DeFi Yield Alchemist",
  ],
  python: [
    "Tensorflow Shaman",
    "Pandas Wrangler Supreme",
    "PyTorch GradientSurfer",
    "One-Liner Genius",
    "Global Interpreter Lock Surfer",
  ],
  ai: [
    "Neural Net Whisperer",
    "AI Prompt Surfer",
    "LLM Fine-Tuner Supreme",
    "GPU Cluster Burner",
    "Vector Database Nomad",
  ],
  ml: [
    "Gradient Descent Explorer",
    "Overfitting Detective",
    "Feature Store Architect",
    "Model Weights Weaver",
  ],
  go: [
    "Goroutine Juggler",
    "Channel Flow Commander",
    "Zero-Alloc Specialist",
    "Microservice Maestro",
  ],
  swift: [
    "SwiftUI Smooth Operator",
    "60 FPS Frame Hunter",
    "CoreAnimation Guru",
    "Apple Silicon Speedster",
  ],
  flutter: [
    "Cross-Platform Ninja",
    "Widget Tree Whisperer",
    "Hot Reload Speedrunner",
    "Dart Pixel Craftsman",
  ],
  node: [
    "Event Loop Navigator",
    "Async/Await Mastermind",
    "NPM Package Architect",
    "Non-Blocking Nomad",
  ],
  web3: [
    "On-Chain Alchemist",
    "MEV Searcher & Shipper",
    "Web3 Protocol Pioneer",
    "Zero-Knowledge Mystic",
    "Solana Speedrunner",
  ],
  devops: [
    "Kubernetes Chaos Tamer",
    "CI/CD Pipeline Master",
    "Terraform Terraformist",
    "Docker Container Captain",
  ],
  blockchain: [
    "Consensus Mechanism Guru",
    "Proof-of-Stake Pilgrim",
    "Cryptographic Enchanter",
    "Peer-to-Peer Prophet",
  ],
  "full-stack": [
    "Zero-to-One Speedrunner",
    "Full-Stack Alchemist",
    "Frontend-to-Backend Titan",
    "Monorepo Maestro",
  ],
  ios: [
    "Xcode Crash Survivor",
    "App Store Deployer",
    "Metal Shading Specialist",
  ],
  android: [
    "Kotlin Coroutine Captain",
    "Gradle Build Survivor",
    "Jetpack Compose Artisan",
  ],
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateLocalStackTitles(stack: string): string[] {
  const stackLower = stack.toLowerCase();
  const matchedTitles: string[] = [];

  for (const [key, titles] of Object.entries(STACK_TITLE_MAP)) {
    if (stackLower.includes(key)) {
      matchedTitles.push(...titles);
    }
  }

  const combinedPool = [
    ...shuffleArray(matchedTitles),
    ...shuffleArray(FUN_TITLES),
  ];

  // Remove duplicates while preserving order
  const uniqueTitles = Array.from(new Set(combinedPool));

  return uniqueTitles.slice(0, 5);
}

export async function fetchAiTitles(stack: string): Promise<string[]> {
  try {
    const res = await fetch("/api/generate-titles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stack }),
    });

    if (res.ok) {
      const data = (await res.json()) as { titles?: string[] };
      if (data.titles && Array.isArray(data.titles) && data.titles.length > 0) {
        return data.titles;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch AI titles, using local generator:", err);
  }

  return generateLocalStackTitles(stack);
}

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
