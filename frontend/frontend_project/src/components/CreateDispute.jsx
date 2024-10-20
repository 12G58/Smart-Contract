import React, { useState } from "react";
import { getArbitrationContract } from "../contractHelpers";

function CreateDispute() {
    const [partyB, setPartyB] = useState("");
    const [details, setDetails] = useState("");
    const [txStatus, setTxStatus] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const arbitration = await getArbitrationContract();
            const tx = await arbitration.createDispute(partyB, details, { gasLimit: 300000 });
            await tx.wait();
            setTxStatus("Dispute created successfully!");
        } catch (err) {
            console.error("Transaction Error: ", err);
            setTxStatus("Error creating dispute: " + err.message);
        }
    };

    return (
        <div>
            <h2>Create a Dispute</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Party B Address</label>
                    <input
                        type="text"
                        className="form-control"
                        value={partyB}
                        onChange={(e) => setPartyB(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label>Dispute Details</label>
                    <input
                        type="text"
                        className="form-control"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Create Dispute
                </button>
            </form>
            {txStatus && <p>{txStatus}</p>}
        </div>
    );
}

export default CreateDispute;
