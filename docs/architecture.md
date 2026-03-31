# ChainEscrow Architecture

```mermaid
graph TD
  A[Client UI \n React + Tailwind] -->|REST| B[API Gateway \n Express]
  B -->|JWT| C[Auth Middleware]
  B -->|CRUD| D[MongoDB]
  B -->|IPFS Hash| E[Pinata/IPFS]
  B -->|Ethers.js| F[FreelanceEscrow \n Smart Contract]
  F -->|Sepolia| G[Ethereum Network]
  B -->|Webhooks/Events| H[Notifications]
```

Flow:
- UI calls backend APIs with JWT; MetaMask signs blockchain actions.
- Backend writes business state to MongoDB and hashes/proofs to IPFS.
- On-chain contract manages escrowed ETH and milestone payouts.
- Events feed transaction history and notifications.
