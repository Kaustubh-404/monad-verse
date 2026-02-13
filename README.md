# CrowdEdge

> Autonomous AI agent that reads Polymarket prediction markets, reasons about trading opportunities using an LLM, and records every decision permanently on the Monad blockchain.

Built for the [Moltiverse Hackathon](https://moltiverse.dev) — Agent+Token Track.

---

## What Is CrowdEdge?

Prediction markets like Polymarket aggregate the collective intelligence of thousands of traders into a single probability. When a market says "11.5% chance the US strikes Iran by Feb 28", that number represents real money betting on real outcomes.

**CrowdEdge is an AI agent that:**
1. Scans 100+ live Polymarket markets every 5 minutes
2. Uses an LLM (Llama 3.3 70B via Groq) to reason about each one
3. Picks the 3 highest-confidence trading opportunities
4. Permanently records every decision on the Monad blockchain with full reasoning
5. Builds a verifiable on-chain track record over time

The key insight: **any AI can claim to have a good strategy. CrowdEdge proves it on-chain.** Every trade decision is a real Monad transaction with a timestamp, the agent's reasoning, and the market probability at the time of the call. When markets resolve, outcomes are recorded. The win rate is stored in a smart contract — public, immutable, and auditable by anyone.

---

## How It Works — Full Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Every 5 minutes                               │
│                                                                  │
│  1. FETCH                                                        │
│     GET gamma-api.polymarket.com/markets                         │
│     → 100 active markets returned                                │
│     → Filter: volume > $1k, liquidity > $5k,                    │
│       probability between 5–95%                                  │
│       (removes near-expired/decided markets)                     │
│     → ~25 meaningful markets remain                              │
│                                                                  │
│  2. REASON (LLM)                                                 │
│     Top 20 markets sent to Groq one by one                       │
│     Prompt per market:                                           │
│       "Market: Will US strike Iran by Feb 28?                    │
│        YES probability: 11.5%                                    │
│        24h Volume: $800k | Liquidity: $131k                      │
│        Should an agent trade this? YES/NO, confidence, why?"     │
│                                                                  │
│     LLM responds with JSON:                                      │
│       { trade: true, action: "NO",                               │
│         confidence: 80,                                          │
│         reasoning: "11.5% appears mispriced given               │
│                     geopolitical context" }                      │
│                                                                  │
│  3. SELECT                                                       │
│     Filter: trade=true AND confidence ≥ 65%                      │
│     Sort by confidence descending                                │
│     Pick top 3                                                   │
│                                                                  │
│  4. PUBLISH TO MONAD                                             │
│     For each signal, call CrowdEdgeVault.logPosition():          │
│       - Market slug (links to Polymarket)                        │
│       - Full question text                                       │
│       - YES or NO decision                                       │
│       - Entry probability at time of call                        │
│       - LLM reasoning (one sentence)                             │
│       - Timestamp (block.timestamp)                              │
│                                                                  │
│     This is a REAL Monad transaction.                            │
│     Verifiable on the block explorer.                            │
│     Immutable. Cannot be changed or deleted.                     │
│                                                                  │
│  5. TRACK                                                        │
│     As markets resolve on Polymarket,                            │
│     resolvePosition(id, wasCorrect) is called                    │
│     Win rate updates on-chain                                    │
│     getWinRate() is public — anyone can verify                   │
└─────────────────────────────────────────────────────────────────┘
```

### What a Position Looks Like On-Chain

```
marketId       → "will-us-strike-iran-by-feb-28"
marketQuestion → "US strikes Iran by February 28, 2026?"
action         → "NO"
entryProbability → 11    (11%)
paperAmountUSD   → 10    ($10 paper trade)
reasoning      → "11.5% appears mispriced given geopolitical context"
openedAt       → 1739449631  (unix timestamp)
resolved       → false
wasCorrect     → false  (updated when market resolves)
```

---

## Why This Matters

### The Problem with AI Trading Signals

Most AI trading bots and signal services operate as black boxes:
- They claim accuracy but provide no proof
- Historical performance can be fabricated
- No way to verify signals were made *before* the outcome

### CrowdEdge's Solution

Every signal is published on Monad **before** the market resolves. The blockchain timestamp proves the call was made in advance. The entry probability is recorded, so you can verify the agent wasn't cherry-picking easy calls after the fact. The win rate accumulates transparently in the smart contract.

**This creates the first truly verifiable AI trading track record.**

### Why Polymarket?

Polymarket is the world's leading prediction market platform with:
- $1B+ in trading volume
- 1000+ active markets across politics, crypto, sports, science
- Real money, real probabilities — not simulated data
- Native Monad integration (Polymarket accepts MON deposits)

### Why Monad?

Monad's high throughput (10,000 TPS) means the agent can publish signals at scale without gas costs becoming prohibitive. Every 5-minute cycle publishes up to 3 transactions — at scale, this could be hundreds of signals per day across many markets.

---

## Architecture

```
crowdedge/
├── src/                    # Agent (TypeScript/Node.js)
│   ├── agent.ts            # Main loop, orchestration
│   ├── polymarket.ts       # Fetch + filter markets
│   ├── llm.ts              # Groq API (Llama 3.3 70B)
│   ├── monad.ts            # Publish to Monad contract
│   └── types.ts            # Shared interfaces
│
├── contracts/              # Smart contracts (Solidity/Foundry)
│   ├── src/
│   │   └── CrowdEdgeVault.sol   # On-chain position ledger
│   └── script/
│       └── Deploy.s.sol         # Deployment script
│
└── frontend/               # Dashboard (React/Vite)
    └── src/
        ├── App.tsx
        ├── config.ts            # Wagmi + contract config
        ├── components/
        │   ├── StatsBar.tsx     # Win rate, position count
        │   ├── PositionFeed.tsx # List of all positions
        │   └── PositionCard.tsx # Individual trade card
        └── hooks/
            └── useVault.ts      # Reads from Monad contract
```

---

## Smart Contract

**CrowdEdgeVault.sol** — deployed on Monad Testnet

```
Address: 0xb9D42824955b492BE4cBf13988C3d0Ad9985F807
Network: Monad Testnet (Chain ID: 10143)
Explorer: https://testnet.monadexplorer.com/address/0xb9D42824955b492BE4cBf13988C3d0Ad9985F807
```

Key functions:

| Function | Who Calls | What It Does |
|---|---|---|
| `logPosition(...)` | Agent wallet | Records a new paper trade decision |
| `resolvePosition(id, bool)` | Agent wallet | Marks a position won/lost after market settles |
| `getWinRate()` | Anyone | Returns win rate 0–100 |
| `getPositionCount()` | Anyone | Returns total positions recorded |
| `getPosition(id)` | Anyone | Returns full details of a position |
| `getLatestPositions(n)` | Anyone | Returns last N positions |

The contract is intentionally simple. No user funds are ever held. It is purely a **public, immutable ledger of the agent's decisions.**

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Agent runtime | Node.js 18+ / TypeScript | Type safety, async/await |
| LLM | Groq API (Llama 3.3 70B) | Free tier, fast inference, capable |
| Data source | Polymarket Gamma API | Free, public, real prediction markets |
| Blockchain | Monad Testnet | High throughput, EVM-compatible |
| Web3 client | viem v2 | Lightweight, TypeScript-native |
| Smart contracts | Solidity 0.8.20 + Foundry | Industry standard |
| Frontend | React 18 + Vite | Fast, modern |
| Wallet UI | RainbowKit + wagmi v2 | Best-in-class Web3 UX |
| Styling | Tailwind CSS v4 | Utility-first, fast |
| Scheduler | node-cron | Runs agent every 5 minutes |

---

## Running Locally

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Foundry (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/crowdedge
cd crowdedge
```

### 2. Set up the agent

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

Edit `.env` and fill in:
- `GROQ_API_KEY` — free at [console.groq.com](https://console.groq.com)
- `PRIVATE_KEY` — a new wallet private key (NOT your main wallet)
- `VAULT_CONTRACT` — see step 4

Get testnet MON for your wallet at [faucet.monad.xyz](https://faucet.monad.xyz)

### 3. Deploy the smart contract

```bash
cd contracts

# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# Deploy to Monad testnet
PRIVATE_KEY=0xyour_key forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key 0xyour_key \
  --broadcast
```

Copy the deployed contract address and paste it into `.env` as `VAULT_CONTRACT`.

```bash
cd ..
```

### 4. Run the agent

```bash
# Build TypeScript
pnpm build

# Start the agent (runs every 5 minutes)
pnpm agent
```

You should see:

```
🚀 CrowdEdge Agent Starting...
💼 Wallet: 0x...
💰 Balance: 9.83 MON
📄 Vault: 0x...

════════════════════════════
🤖 CrowdEdge | 2/13/2026, 2:58:18 PM
════════════════════════════

📡 Fetching Polymarket markets...
   Fetched: 100 | After filter: 25
🤖 Analyzing 20 markets with Groq...
   LLM analyzed: 5 | Tradeable: 5
   Top signals (confidence ≥65%): 3

⛓️  Publishing to Monad testnet...
   📊 US strikes Iran by February 28?
      Action: NO | Confidence: 80% | Prob: 11.5%
      ✅ TX: 0xfa38b4...
```

### 5. Run the frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

The dashboard will automatically read positions from the Monad testnet contract and refresh every 30 seconds.

### 6. Build for production

```bash
cd frontend
pnpm build
# Output in frontend/dist/ — deploy to Vercel, Netlify, etc.
```

---

## The $EDGE Token

**$EDGE** is the CrowdEdge agent's token, launched on [nad.fun](https://nad.fun).

Token utility:
- **Signal access** — hold $EDGE to get real-time alerts when the agent opens a position
- **Governance** — vote on which market categories the agent focuses on (politics, crypto, sports)
- **Revenue share** — when the agent transitions to mainnet with real funds, 50% of trading fees flow to $EDGE holders

The token's value is directly tied to the agent's performance — which is fully public and on-chain. No black box. No trust required.

---

## Live Deployment

| Resource | Link |
|---|---|
| Frontend | https://crowdedge.vercel.app *(deploy to update)* |
| Contract | [Monad Explorer](https://testnet.monadexplorer.com/address/0xb9D42824955b492BE4cBf13988C3d0Ad9985F807) |
| $EDGE Token | [nad.fun](https://nad.fun) *(launch pending)* |
| Polymarket | [polymarket.com](https://polymarket.com) |

---

## Hackathon Context

Built for **Moltiverse** — a 2-week hackathon by [Nad.fun](https://nad.fun) focused on building AI agents on Monad.

**Track:** Agent+Token ($140K prize pool)

**Why CrowdEdge fits the hackathon thesis:**
- Agents need money rails → Monad provides them
- Agents need to build communities → $EDGE token on nad.fun
- Agents need to monetize → performance fees to token holders
- Build in public → every agent decision is on-chain and transparent

---

## License

MIT
