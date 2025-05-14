// src/contract.js
import { ethers } from "ethers";
import abi from "./abi/TaskMarketplace.json";       // ← one level up!

const ABI   = abi;
const ADDR  = import.meta.env.VITE_CONTRACT;
const RPC   = import.meta.env.VITE_RPC_URL;  
const CHAIN = Number(import.meta.env.VITE_CHAIN_ID) || 296;

export async function connectWallet() {
    if (!window.ethereum) throw new Error("Install MetaMask / HashPack");
  
    // 1️⃣ always create provider *after* we know we’re on the right chain
    async function getFresh() {
      const p = new ethers.BrowserProvider(window.ethereum);
      const s = await p.getSigner();
      return { provider: p, signer: s, me: await s.getAddress(),
               contract: new ethers.Contract(ADDR, abi, s) };
    }
  
    // initial request for accounts
    await window.ethereum.request({ method: "eth_requestAccounts" });
  
    let chainId = Number(await window.ethereum.request({ method: "eth_chainId" }));
    if (chainId !== CHAIN) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CHAIN.toString(16)}` }]
        });
      } catch (e) {
        // add chain if it isn’t known yet
        if (e.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: `0x${CHAIN.toString(16)}`,
              chainName: "Hedera Testnet",
              rpcUrls: ["https://testnet.hashio.io/api"],
              nativeCurrency: { name:"HBAR", symbol:"HBAR", decimals:18 },
              blockExplorerUrls: ["https://hashscan.io/testnet"]
            }]
          });
        } else {
          throw e; // user rejected
        }
      }
      // 🔄 refresh chainId
      chainId = Number(await window.ethereum.request({ method: "eth_chainId" }));
      if (chainId !== CHAIN) throw new Error("User stayed on wrong network");
    }
  
    return getFresh();   // provider is now guaranteed on the right chain
  }

/* ───── read helpers ───── */

// Fetch open tasks
export const fetchOpenTasks = async (c) =>
  Promise.all((await c.getAllTaskIds()).map(id => fetchTask(c, id)));

// Fetch a single task along with enhanced submissions
export const fetchTask = async (c, id) => {
  const t = await c.getTask(id);
  const { submissions, description } = await fetchSubmissions(c, id);   // ✨ Correctly destructure

  const enhancedSubs = await Promise.all(
    submissions.map(async (sub) => {
      const status = await fetchSubmissionStatus(c, sub.worker, id);
      return {
        ...sub,
        submissionStatus: Number(status)
      };
    })
  );

  return {
    id,
    client: t.client,
    clientName: t.name,
    description: description,  // ✨ Attach description
    reward: Number(t.reward),
    deadline: Number(t.deadline),
    state: Number(t.state),
    status: t.status,
    approved: t.approvedWorker,
    submissions: enhancedSubs
  };
};



// ⇩⇩  add THIS function right here  ⇩⇩
export async function fetchActiveReviews(c) {
    const ids = await c.getActiveReviewIds();
    return Promise.all(
      ids.map(async id => {

        const rs = await c.getReviewStatus(id);
      const workerAddr = rs[4];
   // ← use the new getter that accepts an address:
      const workerName = await c.getName(workerAddr);
        return {
          id,
          active:  rs[0],
          yes:     Number(rs[1]),
          no:      Number(rs[2]),
          iVoted:  rs[3],
          worker:  rs[4],
          workerName    
        };
      })
    );
  }

export async function fetchSubmissionStatus(contract, user, taskId) {
    const status = await contract.submissionStatus(user, taskId);
    return Number(status); // 0 = None, 1 = Claimed, 2 = Submitted, 3 = Approved, 4 = Rejected
  }
  

export async function fetchSubmissions(contract, taskId) {
    const [rawSubs, _desc]  = await contract.getSubmissions(taskId);
    // console.log("Raw Submission target:", target);
    const submissions = await Promise.all(
      rawSubs.map(async (target) => {
        console.log("Raw Submission target:", target);
        if (!target || !target[0]) return null;
  
        const rep = await contract.getReputation(target[0]);
  
        return {
          worker:    target[0],
          name:      target[1] || "",
          proof:     target[2] || "",
          submitted: Boolean(target[3]),
          rejected:  Boolean(target[4]),
          reputation: Number(rep)
        };
      })
    );
  
    return { submissions: submissions.filter(sub => sub !== null), description : _desc };
  }
  

// ───── read-only contract for initial load ─────
export function getReadOnlyContract() {
     const provider = new ethers.JsonRpcProvider(RPC);
      return new ethers.Contract(ADDR, ABI, provider);
}