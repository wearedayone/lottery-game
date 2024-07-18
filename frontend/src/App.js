import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "./contract/CommitRevealLottery.json";
import "./App.css";

const provider = new ethers.BrowserProvider(window.ethereum);
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contract = new ethers.Contract(
  contractAddress,
  contractABI.abi,
  provider
);

function App() {
  const [account, setAccount] = useState(null);
  const [commitment, setCommitment] = useState("");
  const [guess, setGuess] = useState("");
  const [blindingFactor, setBlindingFactor] = useState("");
  const [players, setPlayers] = useState([]);
  const [recentWinner, setRecentWinner] = useState("");
  const [message, setMessage] = useState("");
  const [display, setDisplay] = useState(false);
  const [owner, setOwner] = useState("");

  useEffect(() => {
    if (account) {
      loadContractData();
    }
  }, [account]);

  const loadContractData = async () => {
    await getOwner();
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        await getOwner();
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.error("No Ethereum provider found. Install MetaMask!");
    }
  };

  const handleCommit = async () => {
    if (!account) {
      setMessage("Please connect your wallet first");
      return;
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    try {
      const comm = ethers.solidityPackedKeccak256(
        ["uint256", "bytes32"],
        [guess, ethers.encodeBytes32String(blindingFactor)]
      );
      await contractWithSigner.commit(comm, {
        value: ethers.parseEther("0.001"),
      });
      setCommitment(comm);
      setMessage("Commitment submitted successfully!");
      loadContractData();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const getOwner = async () => {
    if (!account) {
      setMessage("Please connect your wallet first");
      return;
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    try {
      const ownerWallet = await contractWithSigner.owner();
      if (account === ownerWallet) setDisplay(true);
      console.log("ownerWallet", ownerWallet);
      setOwner(ownerWallet);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDrawWinner = async () => {
    if (!account) {
      setMessage("Please connect your wallet first");
      return;
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    try {
      await contractWithSigner.drawWinner();
      setMessage("Draw winner successfully!");
      loadContractData();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleTransferOwnership = async () => {
    if (!account) {
      setMessage("Please connect your wallet first");
      return;
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    try {
      await contractWithSigner.transferOwnership("Brian's wallet address");
      setMessage("Transfer ownership successfully!");
      loadContractData();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const startNewRound = async () => {
    if (!account) {
      setMessage("Please connect your wallet first");
      return;
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    try {
      await contractWithSigner.startNewRound(60, 60);
      setMessage("New round started successfully!");
      loadContractData();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleReveal = async () => {
    if (!account) {
      setMessage("Please connect your wallet first");
      return;
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    try {
      await contractWithSigner.reveal(
        parseInt(guess),
        ethers.encodeBytes32String(blindingFactor)
      );
      setMessage("Reveal submitted successfully!");
      loadContractData();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <h1>Commit-Reveal Lottery Game</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet with MetaMask</button>
      ) : (
        <p>Connected account: {account}</p>
      )}
      <p>Commitment: {commitment}</p>

      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Your guess"
      />
      <input
        type="text"
        value={blindingFactor}
        onChange={(e) => setBlindingFactor(e.target.value)}
        placeholder="Blinding factor"
      />
      <button onClick={handleCommit}>Commit</button>
      <button onClick={handleReveal}>Reveal</button>

      {display && (
        <div>
          <button className="fadeIn" onClick={startNewRound}>Start New Round</button>
          <button className="fadeIn" onClick={handleDrawWinner}>Draw Winner</button>
          <button onClick={handleTransferOwnership}>Transfer Ownership</button>
        </div>
      )}

      <p>{message}</p>
      <h2>Players</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
      <h2>Recent Winner</h2>
      <p>{recentWinner}</p>
    </div>
  );
}

export default App;