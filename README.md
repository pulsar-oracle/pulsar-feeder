# Pulsar Feeder

> Off-chain feeder node for the [Pulsar](https://github.com/pulsar-oracle/pulsar-contracts) decentralized oracle network on Stellar.

Feeder nodes fetch data from external sources (CEXs, price APIs, etc.), sign it with the operator's key, and submit it to the Pulsar aggregator contract on Soroban. The more independent operators, the more decentralized and reliable the network.

## Related Repositories

| Repository | Contents |
|------------|----------|
| [pulsar-contracts](https://github.com/pulsar-oracle/pulsar-contracts) | Soroban aggregator contract (Rust) |
| **pulsar-feeder** (this repo) | Off-chain feeder node (TypeScript) |
| [pulsar-website](https://github.com/pulsar-oracle/pulsar-website) | Landing page |

## Project Structure

```
pulsar-feeder/
├── src/
│   ├── index.ts        # Entry point
│   ├── config.ts       # Environment config loading & validation
│   ├── submitter.ts    # Stellar transaction builder & submitter
│   └── adapters/       # Data source adapters (CoinGecko, Binance, ...)
├── .env.example
├── package.json
└── tsconfig.json
```

## Getting Started

Prerequisites: Node.js 20+ and a funded Stellar account.

```bash
git clone https://github.com/pulsar-oracle/pulsar-feeder.git
cd pulsar-feeder
npm install

cp .env.example .env
# Edit .env: FEEDER_SECRET_KEY, PULSAR_CONTRACT_ID, SOROBAN_RPC_URL, ACTIVE_FEEDS

npm run build
npm run start
```

| Variable | Description | Default |
|----------|-------------|---------|
| `STELLAR_NETWORK` | `testnet` or `mainnet` | `testnet` |
| `SOROBAN_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `PULSAR_CONTRACT_ID` | Deployed aggregator contract ID | — |
| `FEEDER_SECRET_KEY` | Feeder's Stellar secret key | — |
| `SUBMISSION_INTERVAL` | Seconds between submissions | `60` |
| `ACTIVE_FEEDS` | Comma-separated feed IDs, e.g. `XLM_USD,BTC_USD` | `XLM_USD` |

## Adding a Data Source

Implement the `FeedAdapter` interface in `src/adapters/`:

```ts
export interface FeedAdapter {
  feedId: string;                 // e.g. "XLM_USD"
  fetchValue(): Promise<bigint>;  // scaled by 1_000_000
}
```

## Development

```bash
npm run dev     # run with ts-node
npm test        # node:test suite
npm run lint
```

## Contributing

1. Fork the repository and create a feature branch
2. Run `npm run lint` and `npm test` before committing
3. Open a Pull Request

## License

MIT — see [LICENSE](./LICENSE).
