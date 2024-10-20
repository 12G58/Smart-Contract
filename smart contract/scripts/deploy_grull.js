const hre = require("hardhat");

async function main() {
    console.log("Deploying GRULLToken...");

    // Get the contract factory for GRULLToken
    const GRULLToken = await hre.ethers.getContractFactory("GRULLToken");

    // Define initial supply
    const initialSupply = 1000000; // Example initial supply

    // Deploy the contract
    const grullToken = await GRULLToken.deploy(initialSupply);
    console.log(grullToken);

    const deployedAddress = grullToken.target;
    // Log the contract address
    console.log(`GRULLToken deployed to: ${deployedAddress}`);

    console.log("Deploying Arbitration contract...");

    // Get the contract factory for Arbitration
    const Arbitration = await hre.ethers.getContractFactory("Arbitration");

    // Deploy the Arbitration contract with the address of the GRULLToken contract
    const arbitration = await Arbitration.deploy(deployedAddress);
    // await arbitration.deployed();

    console.log(`Arbitration deployed to: ${arbitration.target}`);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });

