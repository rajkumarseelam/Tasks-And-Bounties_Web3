import { useState } from "react";

export default function TaskForm({ onCreate }) {
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!desc || !reward || !deadline) return alert("Fill all fields!");
    if (Number(reward) <= 0) return alert("Reward must be > 0");

    onCreate({
      desc,
      rewardEth: reward,
      deadline: Math.floor(new Date(deadline) / 1000)
    });

    setDesc("");
    setReward("");
    setDeadline("");
  };

  return (
    <form className="flex flex-col gap-3 mb-6" onSubmit={submit}>
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Task Description"
        className="border px-2 py-2 rounded"
        required
      />
      <input
        value={reward}
        onChange={(e) => setReward(e.target.value)}
        placeholder="Reward (HBAR)"
        className="border px-2 py-2 rounded"
        type="number"
        step="0.001"
        required
      />
      <input
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        type="datetime-local"
        className="border px-2 py-2 rounded"
        required
      />
      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
        Create Task
      </button>
    </form>
  );
}
