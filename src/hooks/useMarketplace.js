// src/hooks/useMarketplace.js
import { useState, useCallback, useEffect } from "react";
import {
  connectWallet,
  fetchOpenTasks,
  fetchActiveReviews, 
  getReadOnlyContract      
} from "../contract";
import { ethers } from "ethers";
import toast from "react-hot-toast";

export default function useMarketplace() {
  const [isJudge, setIsJudge] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer,   setSigner]   = useState(null);
  const [me,       setMe]       = useState(null);
  const [contract, setContract] = useState(null);
  const [tasks,    setTasks]    = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [myName,   setMyName]   = useState("");
  const [balance,  setBalance]  = useState("0.0");

  // ───── Read-only fetch of open tasks on mount ─────
  useEffect(() => {
    const readOnly = getReadOnlyContract();
    fetchOpenTasks(readOnly)
      .then(setTasks)
      .catch(err => console.error("Initial load failed", err));
  }, []);

  // Reload tasks, reviews, display-name, and HBAR balance
  const reload = useCallback(
    async (c = contract) => {
      if (!c || !provider || !me) return;
      try {
        const [openTasks, activeReviews, name, rawBal] = await Promise.all([
          fetchOpenTasks(c),
          fetchActiveReviews(c),
          c.getMyName(),
          provider.getBalance(me)
        ]);
        setTasks(openTasks);
        setReviews(activeReviews);
        setMyName(name);
        setBalance(ethers.formatEther(rawBal));
      } catch (err) {
        console.error("Reload failed", err);
        toast.error(err.reason || err.message || "Failed to reload data");
      }
    },
    [contract, provider, me]
  );



   
  // Connect wallet + initial load
  const connect = async () => {
    try {
      const res = await connectWallet();
      setProvider(res.provider);
      setSigner(res.signer);
      setMe(res.me);
      setContract(res.contract);
      const judgeFlag = await res.contract.isJudge(res.me);
       setIsJudge(judgeFlag);

      const [name, rawBal] = await Promise.all([
        res.contract.getMyName(),
        res.provider.getBalance(res.me)
      ]);
      setMyName(name);
      setBalance(ethers.formatEther(rawBal));

      await reload(res.contract);
      toast.success("Wallet connected");
    } catch (err) {
      console.error("Connect failed", err);
      toast.error(err.reason || err.message || "Failed to connect wallet");
    }
  };

  // // Helper to handle tx, reload, and show toast
  // const tx = (txPromise, successMsg) =>
  //   txPromise
  //     .then(txRes => txRes.wait())
  //     .then(() => {
  //       reload();
  //       toast.success(successMsg);
  //     })
  //     .catch(err => {
  //       console.error("Transaction failed", err);
  //       toast.error(err.reason || err.message || "Transaction failed");
  //     });

const tx = async (txPromise, successMsg) => {
            try {
             const txRes   = await txPromise;
             const receipt = await txRes.wait();
              console.log("🔎 Transaction receipt:", receipt);
        
              // decoded Solidity events
             console.log(
            "📣 Events:",
              receipt.events?.map(e => ({
                event:   e.event,
                 args:    e.args,
                 address: e.address
               })) || []
             );
        
             toast.success(successMsg);
             reload();
            } catch (err) {
              console.error("Transaction failed", err);
             toast.error(err.reason || err.message || "Transaction failed");
          }
          };

  // Contract interactions
  const createTask = ({ desc, rewardEth, deadline }) =>
    tx(
      contract.createTask(
        desc.trim(),
        BigInt(deadline),
        { value: ethers.parseEther(String(rewardEth)) }
      ),
      "Task created!"
    );
  const claimTask    = id      => tx(contract.claimTask(id),          "Task claimed!");
  const submitTask   = (id, p) => tx(contract.submitTask(id, p),       "Task submitted!");
  const approveTask  = (id, w) => tx(contract.approveTask(id, w),      "Submission approved!");
  const rejectSub    = (id, w) => tx(contract.rejectSubmission(id, w), "Submission rejected");
  const raiseDispute = id      => tx(contract.raiseReviewRequest(id),"Dispute requested");
  const voteReview   = (id, y) => tx(contract.voteOnReview(id, y),     "Vote recorded");
  
  const cancelTask = (id) => tx(contract.cancelTask(id), "Task cancelled!");
  return {
    provider,
    signer,
    me,
    myName,
    balance,
    contract,
    tasks,
    reviews,
    isJudge,
    connect,
    reload,
    createTask,
    claimTask,
    submitTask,
    approveTask,
    rejectSub,
    raiseDispute,
    voteReview,
    cancelTask
  };
}
