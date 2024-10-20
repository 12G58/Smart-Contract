import React, { useState } from "react";
import { getArbitrationContract } from "../contractHelpers";

function ResolveDispute() {
  const [disputeId, setDisputeId] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      const arbitration = await getArbitrationContract();
      const tx = await arbitration.resolveDispute(disputeId);
      await tx.wait();
      setTxStatus("Dispute resolved successfully!");
    } catch (err) {
      console.error(err);
      setTxStatus("Error resolving dispute.");
    }
  };

  return (
    <div>
      <h2>Resolve Dispute</h2>
      <form onSubmit={handleResolve}>
        <div className="mb-3">
          <label>Dispute ID</label>
          <input
            type="text"
            className="form-control"
            value={disputeId}
            onChange={(e) => setDisputeId(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Resolve Dispute
        </button>
      </form>
      {txStatus && <p>{txStatus}</p>}
    </div>
  );
}

export default ResolveDispute;
