import React, { useState, useMemo, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useMarketplace from "./hooks/useMarketplace";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import ReviewPanel from "./components/ReviewPanel";

export default function App() {
  const mp = useMarketplace();
  const {
    me,  //Wallet address
    myName,
    balance,
    tasks,
    reviews,
    isJudge,
    reload,
    connect,
    createTask,
    claimTask,
    submitTask,
    approveTask,
    rejectSub,
    raiseDispute,
    voteReview,
    cancelTask,      
  } = mp;

  const [view, setView] = useState("open");

  useEffect(() => {
    if (view === "judge" && isJudge) {
      reload();
    }
  }, [view, isJudge, reload]);

  //  Helper: Ensure user sets Name
  async function ensureName() {
    if (!myName || myName.trim() === "") {
      const inputName = prompt("Please set your display name first:");
      if (!inputName || inputName.trim() === "") {
        alert("Name is required to proceed!");
        throw new Error("Name not set");
      }
      const tx = await mp.contract.setName(inputName.trim());
      await tx.wait();
      await reload();
    }
  }

  //  Tasks I created (My Tasks)  //Compute unless tasks and me are changed --- 
  const myTasks = useMemo(
    () => tasks.filter(t => t.client.toLowerCase() === me?.toLowerCase()),
    [tasks, me]
  );

  //  Tasks where I have a Submission (My Submissions)
  const mySubmissions = useMemo(
    () => tasks.filter(t =>
      t.submissions.some(s => s.worker.toLowerCase() === me?.toLowerCase())
    ),
    [tasks, me]
  );

  //  Open tasks for me (only if task is Open and I have NOT Claimed/Submitted)
  const openTasksForMe = useMemo(
    () => tasks.filter(t => {
      if (t.state !== 0) return false; // not Open
      if (t.client.toLowerCase() === me?.toLowerCase()) return false; // creator should not see
      const mySub = t.submissions.find(s => s.worker.toLowerCase() === me?.toLowerCase());
      if (!mySub) return true; // no submission yet
      return mySub.submissionStatus === 0; // submission exists but status None
    }),
    [tasks, me]
  );
  
  return (
    <>
      <Toaster position="top-right" />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <Header
          me={me}
          myName={myName}
          balance={balance}
          contract={mp.contract}
          connect={connect}
          reload={reload}
        />

        {me ? (
          <>
            <Navbar view={view} setView={setView} isJudge={isJudge} />

            {/* Create Task */}
            {view === "create" && (
              <TaskForm onCreate={async (task) => {
                await ensureName();
                await createTask(task);
              }} />
            )}

            {/* Open Tasks */}
            {view === "open" && (
              <TaskList
              list={openTasksForMe}
              me={me}
              contract={mp.contract}    
              isOpenView={true}
              onClaim={claimTask}
              onSubmit={submitTask}
              onApprove={approveTask}
              onReject={rejectSub}
              onDispute={raiseDispute}
              onCancel={cancelTask}
              emptyText="No new tasks available."
            />
            )}

            {/* My Tasks */}
            {view === "mine" && (
              <TaskList
              list={myTasks}
              me={me}
              contract={mp.contract}    
              onClaim={claimTask}
              onSubmit={submitTask}
              onApprove={approveTask}
              onReject={rejectSub}
              onDispute={raiseDispute}
              onCancel={cancelTask}
              emptyText="You haven’t created any tasks yet."
            />
            
            )}

            {/* My Submissions */}
            {view === "submitted" && (
              <TaskList
              list={mySubmissions}
              me={me}
              contract={mp.contract}    
              onClaim={claimTask}
              onSubmit={submitTask}
              onReject={rejectSub}
              onDispute={raiseDispute}
              onCancel={cancelTask}
              emptyText="You haven’t submitted to any tasks yet."
            />
            
            )}

            {/* Judge Panel */}
            {view === "judge" && isJudge && (
              <ReviewPanel
                reviews={reviews}
                tasks={tasks}
                vote={voteReview}
              />
            )}
          </>
        ) : (
          <p className="text-center italic text-gray-500">
            Connect your wallet to get started.
          </p>
        )}
      </main>
    </>
  );
}

/* 🛑 Helper: Task List */
function TaskList({
  list,
  me,
  contract,       
  isOpenView = false,
  onClaim = () => {},
  onSubmit = () => {},
  onApprove = () => {},
  onReject = () => {},
  onDispute = () => {},
  onCancel = () => {},
  emptyText
}) {
  return (
    <section className="space-y-4">
      {list.map(t => (
        <TaskCard
          key={t.id.toString()}
          t={t}
          me={me}
          isOpenView={isOpenView}
          onClaim={onClaim}
          onSubmit={onSubmit}
          onApprove={onApprove}
          onReject={onReject}
          onDispute={onDispute}
          onCancel={onCancel}
          contract={contract}   // <-- ✅ Pass contract cleanly to TaskCard
        />
      ))}
      {!list.length && (
        <p className="text-center italic text-gray-500">{emptyText}</p>
      )}
    </section>
  );
}

