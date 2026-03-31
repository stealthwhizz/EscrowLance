# ChainEscrow

ChainEscrow is a full-stack, milestone-based freelance escrow platform. Clients fund projects to a smart contract on Sepolia, freelancers submit IPFS proofs, and payments release automatically after client approval. The stack ships with React + Tailwind, Express + MongoDB, and a Hardhat Solidity contract using OpenZeppelin security.

## Tech Stack
- Frontend: React, Vite, Tailwind, React Router, Axios, Ethers (MetaMask integration)
- Backend: Node.js, Express, MongoDB/Mongoose, JWT auth, Multer uploads, Pinata/IPFS helper, Ethers
- Blockchain: Solidity (Hardhat), OpenZeppelin Ownable + ReentrancyGuard, Sepolia-ready

## Project Structure
- `frontend/` – React app with dashboard pages, wallet connect, project/milestone UI
- `backend/` – Express API, JWT auth, IPFS uploads, Mongo models, blockchain helpers
- `blockchain/` – Hardhat project with `FreelanceEscrow.sol`, deploy script, tests
- `docs/` – Architecture diagram and notes

## Quick Start
1) **Env files**
	- Copy `.env.example` → `.env` (root), `backend/.env.example` → `backend/.env`, `blockchain/.env.example` → `blockchain/.env`.
2) **Install deps**
	- `npm run install:all`
3) **Run services** (separate terminals)
	- API: `npm run dev:backend`
	- Frontend: `npm run dev:frontend`
	- Hardhat node (optional for local): `npm run dev:blockchain`
4) **Compile & test contract**
	- `cd blockchain && npx hardhat test`
5) **Deploy to Sepolia**
	- Set `SEPOLIA_RPC_URL` and `PRIVATE_KEY` then `npm run deploy:sepolia --prefix blockchain`
	- Update `CHAINESCROW_CONTRACT_ADDRESS` in `.env` and `frontend/.env`.

## Environment Variables
See `.env.example` and `backend/.env.example` for all keys:
- Backend: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `CHAINESCROW_CONTRACT_ADDRESS`, `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, `PINATA_*`, SMTP settings.
- Frontend: `VITE_API_BASE_URL`, `VITE_CHAINESCROW_CONTRACT_ADDRESS`, `VITE_SEPOLIA_CHAIN_ID`.
- Hardhat: `SEPOLIA_RPC_URL`, `PRIVATE_KEY`.

## API Surface (summary)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- Projects: `POST /api/projects/create`, `GET /api/projects`, `GET /api/projects/:id`, `PUT /api/projects/:id/status`, `POST /api/projects/:id/fund`, `POST /api/projects/:id/assign`
- Milestones: `POST /api/milestones/create`, `/submit`, `/approve`, `/release`, `GET /api/milestones/project/:projectId`
- Transactions: `GET /api/transactions`, `POST /api/transactions/save`
- Disputes: `POST /api/disputes/create`, `/resolve`
- IPFS: `POST /api/upload`, `POST /api/upload/json`

## Smart Contract (FreelanceEscrow)
- Security: Ownable, ReentrancyGuard, client/freelancer role gates
- Core functions: `createProject`, `fundProject`, `assignFreelancer`, `submitMilestone`, `approveMilestone`, `releasePayment`, `raiseDispute`, `resolveDispute`, `cancelProject`, `refundClient`, `getProject`, `getMilestones`
- Events: `ProjectCreated`, `ProjectFunded`, `FreelancerAssigned`, `MilestoneSubmitted`, `MilestoneApproved`, `PaymentReleased`, `DisputeRaised`, `RefundIssued`
- Tests: Hardhat specs cover project creation, funding, milestone submit/approve/release, unauthorized access, dispute flow

## Data Models (MongoDB)
- Users: name, email, hashed password, role (`client|freelancer|admin`), walletAddress
- Projects: title, description, clientId, freelancerId, budget, deadline, status, contractProjectId, milestones
- Milestones: projectId, title, description, amount, deadline, status, ipfsHash, workHash
- Transactions: projectId, milestoneId, amount, txHash, status
- Disputes: projectId, milestoneId, reason, raisedBy, status, resolution

## IPFS Flow
1) Freelancer uploads file → backend `POST /api/upload` (Multer memory) → Pinata → IPFS hash
2) Hash saved in Mongo + sent to smart contract in `submitMilestone`
3) UI renders proof link via IPFS gateway

## Frontend Pages
- Landing, Login, Signup
- Dashboard (stats + milestones), Create Project, Project Details
- Milestone Submission, Transactions, Disputes, Wallet Connect, Profile

## Architecture
See `docs/architecture.md` for the system diagram.

## Sample Dummy Payloads
- Milestones array for project creation:
```
[
  { "title": "UI Design", "description": "Design all frontend pages", "amount": "0.05", "deadline": "2026-04-10" },
  { "title": "Backend APIs", "description": "Build all backend endpoints", "amount": "0.10", "deadline": "2026-04-20" }
]
```
- Transaction document example:
```
{ "projectId": "001", "milestoneId": "1", "amount": "0.1", "txHash": "0xabc123...", "status": "Completed" }
```

## Notes
- Use MetaMask on Sepolia; ensure chain ID `11155111`.
- Gas estimator and notifications can be added using Ethers event listeners/webhooks.
