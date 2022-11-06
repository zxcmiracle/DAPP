// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "./MyERC20.sol";
import "./MyERC721.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract ClubDAO {

    // use a event if you want
    event ProposalInitiated(uint32 proposalIndex);

    struct Proposal {
        uint32 index;      // index of this proposal 序号
        address proposer;  // who make this proposal 发起者
        uint256 startTime; // proposal start time 起始时间
        uint256 endTime; // proposal end time 结束时间
        string name;       // proposal name 提案名称
        bool finish;       //投票是否结束
        bool reward;       //是否领取奖励
        //mapping(address => bool) voteAddressList;   //已投票的名单
        // TODO add any member if you want
    }

    struct Proposals{
        mapping(uint32 => Proposal) getProposals; // A map from proposal index to proposal
        uint new_index;         //最新合约的序号
        uint clubcoinForAdd;         // 发起提案消耗的积分
        uint clubcoinForVote;         // 投票提案消耗的积分
        uint clubcoinForReward;         // 提案通过奖励的积分
        uint256 duration;  // proposal duration 提案持续时间
    }

    struct Result{  //对应一个提案
        uint32 proposalIndex;      // 对应提案序号
        mapping(address => bool) voteAddressList;   //已投票的名单
        uint32 agree;               //获得支持数
        uint32 disagree;            //获得反对数
        uint32 finalResult;         //最终结果（通过=1，不通过=0）
    }

    struct Results{
        mapping(uint32 => Result) getResults; // A map from proposal index to proposal
    }



    // ...
    // TODO add any variables if you want

    MyERC20 public clubcoin;
    MyERC721 public clubbonus;
    Proposals public proposals; // 提案信息
    Results results;            //结果信息
    uint32 proposalNum = 0;    //累计提案数
    uint32 tokenId = 1000;      //纪念品编号
    mapping(address => uint32) addProposalTimes;    //用户发起提案的次数
    mapping(address => uint32) voteProposalTimes;   //用户投票提案的次数
    
    constructor() {
        // maybe you need a constructor
        clubcoin = new MyERC20("ClubCoin", "CC");
        clubbonus = new MyERC721("ClubBonus", "CB");
        proposals.duration = 600;   //单位：秒
        proposals.clubcoinForAdd = 2500;
        proposals.clubcoinForVote = 1000;
        proposals.clubcoinForReward = 5000;
    }

    event voteProposal(uint32 agree, uint32 index, uint time, address student);   //记录投票行为

    function addProposal (string calldata proposalName, uint time) public {
        require(clubcoin.balanceOf(msg.sender) >= proposals.clubcoinForAdd, "Unaffordable for adding a proposal.");   //检查用户是否有足够积分发起提案

        clubcoin.transferFrom(msg.sender, address(this), proposals.clubcoinForAdd);    //扣除积分：用户委托合约，把发起提案所需积分转给合约

        Proposal memory newProposal = Proposal({
            index : proposalNum,
            proposer : msg.sender,
            startTime : time,    //获取当前时间
            endTime : time + proposals.duration, 
            name : proposalName,
            finish : false,
            reward : false
        });
        proposals.new_index = proposalNum;
        proposals.getProposals[proposalNum] = newProposal; // 添加一个提案
        proposalNum ++;                   //提案编号自增
        addProposalTimes[msg.sender]++;    //发起提案次数加一

    }

    function voteProposal (uint32 agree, uint32 index, uint time, address student) public {
        require(clubcoin.balanceOf(student) >= proposals.clubcoinForVote, "Unaffordable for voting a proposal.");   //检查用户是否有足够积分发起提案
        clubcoin.transferFrom(student, address(this), proposals.clubcoinForVote);    //扣除积分：用户委托合约，把发起提案所需积分转给合约
        require(results.getResults[index].voteAddressList[student] == false, "This user has already voted");
        require(proposals.getProposals[index].endTime > time, "This proposal has already finished");
        require(voteProposalTimes[student] <= 5, "You have voted too much times");
        if(agree == 1)
            results.getResults[index].agree++;      //提案支持+1
        if(agree == 0)
            results.getResults[index].disagree++;      //提案反对+1
        results.getResults[index].voteAddressList[student] = true;
        voteProposalTimes[student]++;    //投票提案次数加一
        emit voteProposal(agree, index, time, student); //记录事件：新增提案
    }

    //Read：查看提案最终投票结果
    function getProposalFinalResult(uint32 index, uint time) public view returns (string memory) {
        require(proposals.getProposals[index].endTime < time, "This proposal is voting.");   //投票还没结束
        if(results.getResults[index].finalResult == 1)
            return "Pass";
        else
            return "Fall";
    }

    //刷新提案结果
    function updateProposalResult (uint32 index,uint time) public payable returns (string memory){    //刷新投票结果
        require(proposals.getProposals[index].endTime < time, "This proposal is voting.");   //投票还没结束
        proposals.getProposals[index].finish == true;
        if(results.getResults[index].agree > results.getResults[index].disagree){
            //clubcoin.transferFrom(address(this), proposals.getProposals[index].proposer, proposals.clubcoinForReward);    //赠与积分奖励
            results.getResults[index].finalResult = 1;
            return "Pass";
        }
        else{
            results.getResults[index].finalResult = 0;
            return "Fall";
        }
    }

    //获取提案通过的奖励（部分条件在前端判定）
   function getProposalReward (uint32 index) public payable{
        require(proposals.getProposals[index].proposer == msg.sender, "Only proposer can read proposal result while voting.");  //只有投票发起人可以领取奖励
        require(proposals.getProposals[index].reward == false, "You have already gotten the reward");  //已领取奖励
        proposals.getProposals[index].reward = true;
   }

    //获取纪念品奖励
   function getBonus () public payable{
        require (addProposalTimes[msg.sender] >= 3, "You should add more than three proposals to get bonus.");
        tokenId ++;
        clubbonus.award(tokenId);
   }

    //Read：查看提案名
    function getProposalName(uint32 index) public view returns (string memory) {
        return proposals.getProposals[index].name;
    }
    
    //Read：查看提案投票支持数
    function getProposalAgree(uint32 index) public view returns (uint32) {
        //require(proposals.getProposals[index].proposer == msg.sender, "Only proposer can read proposal result while voting.");   //只有投票发起人可以查看
        return results.getResults[index].agree;
    }
    //Read：查看提案投票反对数
    function getProposalDisagree(uint32 index) public view returns (uint32) {
        //require(proposals.getProposals[index].proposer == msg.sender, "Only proposer can read proposal result while voting.");   //只有投票发起人可以查看
        return results.getResults[index].disagree;
    }

    //Read：查看当前时间
    function getTime() public view returns (uint) {
        return block.timestamp;
    }

    //Read：查看提案开始时间
    function getStartTime(uint32 index) public view returns (uint) {
        return proposals.getProposals[index].startTime;
    }

    //Read：查看提案结束时间
    function getEndTime(uint32 index) public view returns (uint) {
        return proposals.getProposals[index].endTime;
    }

    //Read：查看当前同学发起提案次数
    function getAddProposalTimes(address student) public view returns (uint32) {
        return addProposalTimes[student];
    }

    //Read：查看当前同学投票提案次数
    function getVoteProposalTimes(address student) public view returns (uint32) {
        return voteProposalTimes[student];
    }


}

    /*function disagreeProposal (uint32 index, uint time) public {
        require(clubcoin.balanceOf(msg.sender) >= proposals.clubcoinForVote, "Unaffordable for voting a proposal.");   //检查用户是否有足够积分发起提案
        clubcoin.transferFrom(msg.sender, address(this), proposals.clubcoinForVote);    //扣除积分：用户委托合约，把发起提案所需积分转给合约
        require(results.getResults[index].voteAddressList[msg.sender] == false, "This user has already voted");
        require(proposals.getProposals[index].endTime > time, "This proposal has already finished");
        require(students.voteProposalTimes[msg.sender] <= 5, "You have voted too much times");

        results.getResults[index].agree--;      //提案得票-1
        results.getResults[index].voteAddressList[msg.sender] = true;
        students.voteProposalTimes[msg.sender]++;    //投票提案次数加一
    }*/
