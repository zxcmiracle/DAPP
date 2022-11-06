import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x4ebd5eef41d0a8b05d89158732afb02e68aea4123375a464a24b6f51e3ddcd25',
        '0x9c40c679a6e40bda8c99423c18bc10bf7ae344368e721d1f7e9edc1bf672b48d',
        '0xa9597d78c9cd083e8033d5b9d4c0cf334332c24fb357d7f8271e60a477cc1d50',
        '0x8daa19e585e23571ed65684e9cf4eb7124c6a84b67993db90c4a8fa30dc005ed',
        '0xc22f5bf976fb57bd01bdf481fa38e9f78370c3b1100de308d1e6910d6995a369'
      ]
    },
  },
};

export default config;
