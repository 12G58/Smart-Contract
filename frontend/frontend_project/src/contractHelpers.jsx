import { ethers } from "ethers";
//import arbitrationABI from "../../Smart-Contract/artifacts/contracts/Arbitration.sol/Arbitration.json";
//import grullTokenABI from "../../Smart-Contract/artifacts/contracts/GRULLToken.sol/GRULLToken.json";
import arbitrationABI from "C:/Users/Sushanth/Desktop/GRULLProject/Smart-Contract/artifacts/contracts/Arbitration.sol/Arbitration.json";
import grullTokenABI from "C:/Users/Sushanth/Desktop/GRULLProject/Smart-Contract/artifacts/contracts/GRULLToken.sol/GRULLToken.json";

const arbitrationAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const grullTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Get signer or provider from MetaMask
export async function getProvider() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    return provider;
  } else {
    console.error("MetaMask is not installed!");
  }
}

export async function getArbitrationContract() {
  const provider = await getProvider();
  const signer = provider.getSigner();
  return new ethers.Contract(arbitrationAddress, arbitrationABI.abi, signer);
}

export async function getGrullTokenContract() {
  const provider = await getProvider();
  const signer = provider.getSigner();
  return new ethers.Contract(grullTokenAddress, grullTokenABI.abi, signer);
}
