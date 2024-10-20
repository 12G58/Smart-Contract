import React, { useState } from "react";
import { getArbitrationContract } from "../contractHelpers";

function VoteDispute() {
  const [disputeId, setDisputeId] = useState("");
  const [voteForA, setVoteForA] = useState(true);
  const [txStatus, setTxStatus] = useState("");

  const handleVote = async (e) => {
    e.preventDefault();
    try {
      const arbitration = await getArbitrationContract();
      const tx = await arbitration.vote(disputeId, voteForA);
      await tx.wait();
      setTxStatus("Voted successfully!");
    } catch (err) {
      console.error(err);
      setTxStatus("Error voting.");
    }
  };

  return (
    <div>
      <h2>Vote on a Dispute</h2>
      <form onSubmit={handleVote}>
        <div className="mb-3">
          <label>Dispute ID</label>
          <input
            type="text"
            className="form-control"
            value={disputeId}
            onChange={(e) => setDisputeId(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Vote for Party A</label>
          <input
            type="checkbox"
            checked={voteForA}
            onChange={(e) => setVoteForA(e.target.checked)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Vote
        </button>
      </form>
      {txStatus && <p>{txStatus}</p>}
    </div>
  );
}

export default VoteDispute;
