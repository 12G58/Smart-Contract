require("@nomicfoundation/hardhat-toolbox");
// require("@chainlink/contracts"); // Uncomment if using Chainlink VRF

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27", // Set your primary Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337, // Local network for development
    },
  },
};
