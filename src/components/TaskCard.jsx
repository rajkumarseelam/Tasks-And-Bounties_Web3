import React, { useState } from "react";
import { ethers } from "ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function formatReward(weiBN) {
  const eth = parseFloat(ethers.formatEther(weiBN));
  if (eth === 0) return "0";
  if (eth < 0.000001) return eth.toExponential(2);
  return eth.toFixed(6).replace(/\.?0+$/g, "");
}

const normalizeUrl = (url) =>
  url?.startsWith("http://") || url?.startsWith("https://")
    ? url
    : `https://${url}`;

export default function TaskCard({ t, me, onClaim, onSubmit, onApprove, onReject, onDispute, onCancel, contract,isOpenView }) {
  const isClient = me === t.client;
  const mySub = t.submissions.find(s => s.worker.toLowerCase() === me?.toLowerCase());

  const deadlineDt = dayjs.unix(t.deadline);
  const expired = dayjs().isAfter(deadlineDt);

  if (isOpenView && t.status === "Open" && expired) return null;

  async function checkReviewStatus(taskId) {
    try {
      const res = await contract.getReviewStatus(taskId);
      const active = res[0];
      const yes = Number(res[1]);
      const no = Number(res[2]);

      if (!active) {
        alert("No active review found.");
        return;
      }

      if (yes >= 2) {
        alert("✅ Judges Agreed: Your task will be Approved soon!");
      } else if (no >= 2) {
        alert("❌ Judges Rejected: Your review was not successful.");
      } else {
        alert("🔄 Judges are still verifying. Please check later!");
      }
    } catch (err) {
      console.error("Review status check failed", err);
      alert("Failed to fetch review status.");
    }
  }

  return (
    <div className="border p-4 rounded space-y-2">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">
            Task #{t.id.toString()}
          </h2>
          {mySub && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
              {renderStatus(mySub.submissionStatus)}
            </span>
          )}
        </div>
        <span className="italic">{t.status}</span>
      </header>

      <p><strong>Created By:</strong> {t.clientName}</p>
      <p><strong>Description:</strong> {t.description || "(No description)"}</p>
      <p><strong>Reward:</strong> {formatReward(t.reward)} ℏ</p>

      <p className="flex items-baseline gap-2">
        <strong>Deadline:</strong>
        <time dateTime={deadlineDt.toISOString()} className="font-medium">
          {deadlineDt.format("MM/D/YYYY, h:mm A")}
        </time>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-200 text-green-800">
          {expired ? "Expired" : `in ${deadlineDt.fromNow(true)}`}
        </span>
      </p>

      {/* ───── User Actions: Claim / Submit / Dispute ───── */}
      {!isClient && (
        <>
          {/* Claim Button */}
          {t.state === 0 && (!mySub || mySub.submissionStatus === 0) && (
            <button
              onClick={() => onClaim(t.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Claim Task
            </button>
          )}

          {/* Submit Proof Box */}
          {mySub && mySub.submissionStatus === 1 && (
            <SubmitBox onSubmit={(link) => onSubmit(t.id, link)} />
          )}

          {/* Raise Dispute if Rejected */}
          {mySub && mySub.submissionStatus === 4 && (
            <div className="mt-2 space-y-2">
              <span className="text-red-600 font-semibold">
                Your submission was rejected.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onDispute(t.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded"
                >
                  Raise Dispute
                </button>
                <button
                  onClick={() => checkReviewStatus(t.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Check Review Status
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ───── Client Actions: Approve / Reject / Cancel ───── */}
      {isClient && (
        <>
          {/* Cancel Task Button */}
      {t.state === 0 && (
      (t.submissions.length === 0 || dayjs().isAfter(dayjs.unix(t.deadline))) && (
        <button
          onClick={() => onCancel(t.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Cancel Task
        </button>
      )
      )}


          {/* Show Submissions */}
       {t.submissions.length > 0 && (
            <div className="space-y-3 mt-4">
              {t.submissions.map((s, index) => (
                <div key={s.worker + index} className="border rounded p-3 space-y-2 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p><strong>Worker:</strong> {s.name} ({s.worker})</p>
                      <p><strong>Reputation:</strong> {s.reputation}</p>
                      <p><strong>Status:</strong> {renderStatus(s.submissionStatus)}</p>
                      <p>
                        <strong>Proof:</strong>{" "}
                        {s.proof ? (
                          <a
                            href={normalizeUrl(s.proof)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">No proof submitted</span>
                        )}
                      </p>
                    </div>

                    {/* Approve / Reject buttons */}
                    {s.submissionStatus === 2 && (
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => onApprove(t.id, s.worker)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(t.id, s.worker)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ───── Submit Proof Box ───── */
function SubmitBox({ onSubmit }) {
  const [link, setLink] = useState("");
  return (
    <div className="space-x-1 mt-2">
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Proof URL"
        className="border px-2 py-1 w-72"
      />
      <button
        onClick={() => onSubmit(link)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
      >
        Submit
      </button>
    </div>
  );
}

/* ───── Status Renderer ───── */
function renderStatus(status) {
  switch (status) {
    case 0: return "None";
    case 1: return "Claimed";
    case 2: return "Submitted";
    case 3: return "Approved";
    case 4: return "Rejected";
    default: return "Unknown";
  }
}
