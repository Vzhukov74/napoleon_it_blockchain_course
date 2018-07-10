pragma solidity ^0.4.9;

contract VoteFactory {
  
    struct Vote {
        string question;
        string[] answers;
    } 
  
    address owner;
    Vote[] public votes;
    mapping (uint256 => address) voteToOwner;
  
    modifier onlyOwner(uint256 _voteId) {
        require(voteToOwner[_voteId] == msg.sender);
        _;
    }
  
    constructor() public {
        owner = msg.sender;
    }
  
    function createVote(string _question) public {
        uint256 id = votes.push(Vote(_question, new string[](0))) - 1;
        voteToOwner[id] = msg.sender;
    }
  
    function addAnswer(uint256 voteId, string _answer) public onlyOwner(voteId) {
        votes[voteId].answers.push(_answer);
    }
}