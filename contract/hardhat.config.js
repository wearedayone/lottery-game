require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  networks: {
    // eth_mainnet: {
    //   url: secrets.eth_mainnet_url || ``,
    //   accounts: [secrets.eth_mainnet_key],
    //   gasPrice: 15000000000,
    // },
    defaultNetwork: {
      url: "hardhat",
    },
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    eth_sepolia: {
      url: "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
      accounts: [
        "d0bb929f04a5ade527bf484fc9c53bb35463ab2d34f766839968f217cc25ef10",
      ], // Replace by privateKey
      // gasPrice: 15000000000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    token: "ETH",
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: "1bdef299-9f72-465d-a680-35fdb0b59db0",
  },
  etherscan: {
    apiKey: "K8JNR94ITH2XCRX6V15P8D483D2FM6C99Y",
    // apiKey: '2JSFYE3G4DEMNFY5X1C34H28XNVUKGWWJ4',
    // apiKey: {
    //   // mantle_testnet: 'xyz', //random value
    //   goerli: '2JSFYE3G4DEMNFY5X1C34H28XNVUKGWWJ4',
    //   eth_goerli: '2JSFYE3G4DEMNFY5X1C34H28XNVUKGWWJ4',
    //   base_mainnet: process.env.BASE_ETHERSCAN_API_KEY ?? 'ETHERSCAN_API_KEY',
    //   baseGoerli: 'TPCIRFTJIGMCKINI7RZFXUQDJ48YY1ZJ4I',
    //   base_sepolia: 'TPCIRFTJIGMCKINI7RZFXUQDJ48YY1ZJ4I',
    //   blast_sepolia: 'blast_sepolia',
    //   'blast-mainnet': '2VK4ZW7RSFK4VEPIMN95STMKNBVMP9YGCC',
    // }
  },
  mocha: {
    timeout: 100000,
  },
};
