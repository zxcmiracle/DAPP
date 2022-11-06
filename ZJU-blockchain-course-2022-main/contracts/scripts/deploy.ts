import { ethers } from "hardhat";

async function main() {
  const ClubDAO = await ethers.getContractFactory("ClubDAO");
  const clubDAO = await ClubDAO.deploy();
  await clubDAO.deployed();
  console.log(`clubDAO contract has been deployed successfully in ${clubDAO.address}`)

  const erc20 = await clubDAO.clubcoin()
  console.log(`erc20 contract has been deployed successfully in ${erc20}`)

  const erc721 = await clubDAO.clubbonus()
  console.log(`erc721 contract has been deployed successfully in ${erc721}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});