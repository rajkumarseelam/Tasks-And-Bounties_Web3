// src/components/ReviewPanel.jsx
import React from "react";

const normalizeUrl = (url) =>
  url?.startsWith("http://") || url?.startsWith("https://")
    ? url
    : `https://${url}`;

export default function ReviewPanel({ reviews, tasks, vote }) {
  if (!reviews.length)
    return <p className="italic text-gray-500">No active reviews.</p>;

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <ReviewCard
          key={r.id}
          r={r}
          task={tasks.find((t) => t.id === r.id)}
          vote={vote}
        />
      ))}
    </div>
  );
}

function ReviewCard({ r, task, vote }) {
  const total = r.yes + r.no;

  const sub = task?.submissions?.find(
    (s) => s?.worker?.toLowerCase() === r.worker?.toLowerCase()
  );

  return (
    <div className="border rounded p-4 space-y-3 bg-gray-50">
      <h3 className="font-semibold text-lg">
        Review for Task #{r.id.toString()}
      </h3>

      {/* Worker Info */}
      <div className="space-y-1">
        <p className="text-sm">
          <strong>Submitted by:</strong> {r.workerName || r.worker}
        </p>

        {sub ? (
          <>
            <p className="text-sm">
              <strong>Reputation:</strong> {sub.reputation}
            </p>
            <p className="text-sm">
              <strong>Status:</strong> {renderStatus(sub.submissionStatus)}
            </p>
            <p className="text-sm">
              <strong>Proof:</strong>{" "}
              {sub.proof ? (
                <a
                  href={normalizeUrl(sub.proof)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Proof
                </a>
              ) : (
                <span className="text-gray-400">No proof submitted</span>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            <strong>Submission:</strong> No submission found
          </p>
        )}
      </div>

      {/* Vote Stats */}
      <div className="flex items-center gap-2">
        <span className="px-2 bg-green-200 text-green-800 rounded text-xs">
          Yes {r.yes}
        </span>
        <span className="px-2 bg-red-200 text-red-800 rounded text-xs">
          No {r.no}
        </span>
        <span className="text-xs text-gray-600">{total}/3 votes</span>
      </div>

      {/* Voting Buttons */}
      {!r.iVoted ? (
        <div className="flex gap-2">
          <button
            onClick={() => vote(r.id, true)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          >
            Vote Yes
          </button>
          <button
            onClick={() => vote(r.id, false)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
          >
            Vote No
          </button>
        </div>
      ) : (
        <p className="text-sm italic text-gray-500">You already voted.</p>
      )}
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
