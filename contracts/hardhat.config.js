// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.28",
// };


// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();

// module.exports = {
//   solidity: {
//     version: "0.8.24",
//     settings: { optimizer: { enabled: true, runs: 200 } },
//   },
//   networks: {
//     monadTestnet: {
//       url: process.env.MONAD_TESTNET_RPC,
//       chainId: 10143,
//       accounts: [process.env.PRIVATE_KEY],
//     },
//   },
// };


require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    monadTestnet: {
      url: process.env.MONAD_TESTNET_RPC,
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  // etherscan: {
  //   apiKey: {
  //     monadTestnet: process.env.ETHERSCAN_API_KEY || "placeholder",
  //   },
  //   customChains: [
  //     {
  //       network: "monadTestnet",
  //       chainId: 10143,
  //       urls: {
  //         apiURL: "https://api.etherscan.io/v2/api?chainid=10143",
  //         browserURL: "https://testnet.monadscan.com",
  //       },
  //     },
  //   ],
  // },

  etherscan: {
  apiKey: process.env.ETHERSCAN_API_KEY,
  customChains: [
    {
      network: "monadTestnet",
      chainId: 10143,
      urls: {
        apiURL: "https://api.etherscan.io/v2/api?chainid=10143",
        browserURL: "https://testnet.monadscan.com",
      },
    },
  ],
},
};

