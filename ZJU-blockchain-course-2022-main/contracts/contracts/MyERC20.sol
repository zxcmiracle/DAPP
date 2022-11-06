// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {

    mapping(address => bool) claimedAirdropPlayerList;  //已领取空投的名单

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    }

    function airdrop() external{
        //不能重复领取
        require(claimedAirdropPlayerList[msg.sender] == false, "This user has claimed airdrop already");
        //发放空投
        _mint(msg.sender, 10000);
        claimedAirdropPlayerList[msg.sender] = true;
    }

    function reward() external{
        //提案通过的奖励
        _mint(msg.sender, 5000);
    }
}

