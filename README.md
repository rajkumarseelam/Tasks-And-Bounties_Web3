# Tasks and Bounties - Decentralized Task Marketplace

A Web3 decentralized task marketplace built on Hedera Testnet where clients can post tasks with HBAR rewards, workers can claim and submit proof of completion, and disputes are resolved through a voting system.

## 🌟 Features

- **Task Creation**: Clients can create tasks with descriptions, rewards in HBAR, and deadlines
- **Task Management**: Workers can claim tasks and submit proof of completion
- **Approval System**: Clients can approve or reject submissions
- **Dispute Resolution**: Rejected workers can raise disputes, resolved by a panel of judges
- **Reputation System**: Both clients and workers earn reputation for successful completions
- **Name Registration**: Users can set display names for better identification

## 🏗️ Architecture

### Smart Contract

- Written in Solidity 0.8.20
- Deployed on Hedera Testnet
- Implements a complete task lifecycle (Open → Claimed → Submitted → Approved/Rejected)
- Built-in dispute resolution with 3 judges
- Non-reentrancy protection for financial operations

### Frontend

- React application with Vite
- Web3 integration using ethers.js
- Real-time updates using React hooks
- Responsive UI with Tailwind CSS
- MetaMask wallet integration

## 🚀 Deployment Guide

### Step 1: Deploy Smart Contract using Remix

1. **Access Remix IDE**
   - Navigate to [Remix IDE](https://remix.ethereum.org/)

2. **Create Contract File**
   - Create a new file named `HederaTaskMarketplace.sol` and update with solidity code

3. **Compile Contract**
   - Switch to the Solidity Compiler tab
   - Select compiler version 0.8.20
   - Click "Compile HederaTaskMarketplace.sol"

4. **Configure MetaMask for Hedera Testnet**
   - Open MetaMask
   - Add Hedera Testnet network:
     - Network Name: Hedera Testnet
     - RPC URL: https://testnet.hashio.io/api
     - Chain ID: 296
     - Currency Symbol: HBAR
     - Block Explorer: https://hashscan.io/testnet

5. **Deploy Contract**
   - Switch to "Deploy & Run Transactions" tab
   - Select Environment: Injected Provider - MetaMask
   - Ensure MetaMask is connected to Hedera Testnet
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - Save the deployed contract address

### Step 2: Extract and Update ABI

1. **Get ABI from Remix**
   - After deployment, navigate to the "Contracts" folder in Remix
   - Find your contract under `contracts/artifacts/HederaTaskMarketplace.sol/`
   - Open `HederaTaskMarketplace.json`
   - Copy the entire JSON content

2. **Extract ABI using JSONPath**
   - Go to [JSONPath Online Evaluator](https://jsonpath.com/)
   - Paste the copied JSON in the left panel
   - Enter path: `$.abi[0:]`
   - Copy the result from the right panel

3. **Update Frontend ABI**
   - Navigate to your project's `src/abi/` folder
   - Create/update `TaskMarketplace.json`
   - Paste the extracted ABI

### Step 3: Configure Frontend

1. **Create Environment File**
   - Create `.env` file in the project root
   - Add the following variables:

   ```env
   VITE_RPC_URL=https://testnet.hashio.io/api
   VITE_CONTRACT=0xbb68E2992B3f1388de054A6D3a7BecAe410fB848
   VITE_CHAIN_ID=296
   ```

   > Replace `VITE_CONTRACT` with your deployed contract address

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Application**

   For standard local development:
   ```bash
   npm run dev
   ```

   For network-accessible deployment:
   ```bash
   npm run dev -- --host 0.0.0.0 --port 5174
   ```
   > This allows access from other devices on your network at `http://YOUR_IP:5174`

## 📁 Project Structure

```
tasks-and-bounties/
├── src/
│   ├── abi/
│   │   └── TaskMarketplace.json    # Contract ABI
│   ├── components/
│   │   ├── Header.jsx              # Header with wallet connection
│   │   ├── Navbar.jsx              # Navigation between views
│   │   ├── TaskForm.jsx            # Task creation form
│   │   ├── TaskCard.jsx            # Task display component
│   │   ├── ReviewPanel.jsx         # Judge review interface
│   │   ├── NameForm.jsx            # Name registration
│   │   └── SubmitBox.jsx           # Submission interface
│   ├── hooks/
│   │   └── useMarketplace.js       # Custom hook for contract interaction
│   ├── contract.js                 # Contract connection logic
│   └── App.jsx                     # Main application component
├── .env                            # Environment variables
└── package.json
```

## 🔧 Configuration Details

### Environment Variables

- `VITE_RPC_URL`: Hedera Testnet RPC endpoint
- `VITE_CONTRACT`: Deployed contract address (update after deployment)
- `VITE_CHAIN_ID`: Hedera Testnet chain ID (296)

### Judge Addresses (Hardcoded in Contract)

```
0x71B5742419d93AaDc89094209e219197AcDC2475
0x1C65dadE06339b2fe79E2DB9174c4647a0F73521
0x80314D31c0f83a59523F83B3881D14fB4360a90c
```

## 💡 Usage Guide

### For Clients

1. Connect your MetaMask wallet
2. Set your display name
3. Navigate to "Create" tab
4. Fill in task details and reward amount
5. Submit task (requires HBAR for reward)
6. Monitor submissions in "My Tasks"
7. Approve or reject submissions

### For Workers

1. Connect wallet and set name
2. Browse available tasks in "Open Tasks"
3. Claim a task you want to complete
4. Submit proof URL when done
5. Track your submissions in "My Submissions"
6. Raise dispute if rejected unfairly

### For Judges

1. Access "Judge Panel" (only for authorized addresses)
2. Review disputed submissions
3. Vote Yes or No on each dispute
4. 2/3 majority determines outcome

## 🛡️ Security Features

- **Reentrancy Protection**: Guards against reentrancy attacks
- **Access Control**: Role-based permissions for clients, workers, and judges
- **Deadline Enforcement**: Tasks expire after deadline
- **Escrow System**: Rewards held in contract until approval

## 🔍 Key Contract Functions

### Task Management

- `createTask()`: Create new task with reward
- `claimTask()`: Worker claims a task
- `submitTask()`: Submit proof of completion
- `approveTask()`: Client approves submission
- `rejectSubmission()`: Client rejects submission
- `cancelTask()`: Cancel task (only if no submissions)

### Dispute Resolution

- `raiseReviewRequest()`: Worker initiates dispute
- `voteOnReview()`: Judge votes on dispute
- `getReviewStatus()`: Check dispute status

### View Functions

- `getOpenTaskIds()`: Get all open tasks
- `getTask()`: Get task details
- `getSubmissions()`: Get task submissions
- `getReviewStatus()`: Get review details

## 🌐 Network Information

- **Network**: Hedera Testnet
- **RPC URL**: https://testnet.hashio.io/api
- **Chain ID**: 296
- **Currency**: HBAR
- **Block Explorer**: https://hashscan.io/testnet

## 👥 Responsibilities of Group Members

- **Manas Deshpande**: Smart contract development, dispute logic
- **Muthu Muniyandi Dhamodharan**: UI/UX design, task and submission flows
- **Santhi Raj Kumar Seelam**: Frontend Backend integration, Metamask setup
- **Saurabh Kumar Sahu**: UI/UX design, testing, deployment
- **Shaik Mustaq Ahamed**: Smart contract development, dispute logic

## 📝 License

This project is open source. Feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Remix IDE](https://remix.ethereum.org/)
- [MetaMask](https://metamask.io/)
- [Ethers.js](https://docs.ethers.io/)

## ⚠️ Important Notes

- **Testnet Only**: This is configured for Hedera Testnet. Do not use on mainnet without proper testing and auditing.
- **Judge Addresses**: The judge addresses are hardcoded in the contract. Update these before deploying your own version.
- **Gas Costs**: Ensure you have sufficient HBAR for transaction fees.
- **MetaMask Configuration**: Make sure MetaMask is properly configured for Hedera Testnet before deployment.
