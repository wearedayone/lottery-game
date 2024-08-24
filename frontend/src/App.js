import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './contract/CommitRevealLottery.json';
import './App.css';  // Add this for some basic styling

const provider = new ethers.BrowserProvider(window.ethereum);
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);

function App() {
  const [account, setAccount] = useState(null);
  const [commitment, setCommitment] = useState('');
  const [guess, setGuess] = useState('');
  const [blindingFactor, setBlindingFactor] = useState('');
  const [players, setPlayers] = useState([]);
  const [recentWinner, setRecentWinner] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (account) {
      loadContractData();
    }
  }, [account]);

  const loadContractData = async () => {
    const players = await contract.getPlayers();
    setPlayers(players);
    const winner = await contract.recentWinner();
    setRecentWinner(winner);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
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
      const comm = ethers.solidityPackedKeccak256(["uint256", "bytes32"], [guess, ethers.encodeBytes32String(blindingFactor)]);
      await contractWithSigner.commit(comm, { value: ethers.parseEther("0.001") });
      setCommitment(comm);
      setMessage('Commitment submitted successfully!');
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
      await contractWithSigner.reveal(parseInt(guess), ethers.encodeBytes32String(blindingFactor));
      setMessage('Reveal submitted successfully!');
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
