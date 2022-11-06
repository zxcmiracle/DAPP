// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyERC721 is ERC721 {

    address public owner;

    struct Bonus{
        uint id;       //纪念品编号
        address owner; //纪念品拥有者
    }

    struct AllBonus{        //所有Bonus
        mapping(address => Bonus) getBonus;
    }

    AllBonus private allBonus;
    mapping(address=>bool) getBonus; //是否已获得纪念品
    //mapping(address=>uint) bonusID; //记录纪念品ID

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Not owner.");
        _;
    }
    //纪念品领取
    function award(uint tokenId) external onlyOwner {
        require(getBonus[msg.sender] == false, "This user has claimed bonus already");
        _mint(msg.sender, tokenId);
        Bonus memory newBonus = Bonus({
            id : tokenId,
            owner : msg.sender
        });
        allBonus.getBonus[msg.sender] = newBonus;   //加入一个新纪念品 
        getBonus[msg.sender] = true;
    }
    //纪念品查询
    function myAwardID(address student) public view returns (uint){
        Bonus memory myBonus = allBonus.getBonus[student];  //查询Bonus
        return myBonus.id;  //返回ID
    }
}


