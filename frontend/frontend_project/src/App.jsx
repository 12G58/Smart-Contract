import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CreateDispute from "./components/CreateDispute";
import VoteDispute from "./components/VoteDispute";
import ResolveDispute from "./components/ResolveDispute";

function App() {
  return (
    <div className="container">
      <h1>GRULL Arbitration System</h1>
      <CreateDispute />
      <VoteDispute />
      <ResolveDispute />
    </div>
  );
}

export default App;
