pragma solidity ^0.4.24;

import "./Ownable.sol";

contract VoteFactory is Ownable {
  
    enum State {
        Initial,
        Started,
        Stopped
    }

    struct Vote {
        State state;
        string question;
        string[] answers;
    } 
  
    Vote[] public votes;
    mapping (uint256 => address) voteToOwner;
  
    modifier onlyVoteOwner(uint256 _voteId) {
        require(voteToOwner[_voteId] == msg.sender);
        _;
    }

    modifier onlyInitialVote(uint256 _voteId) {
        require(votes[_voteId].state == State.Initial);
        _;
    }

    modifier onlyStartedVote(uint256 _voteId) {
        require(votes[_voteId].state == State.Started);
        _;
    }

    modifier onlyStoppedVote(uint256 _voteId) {
        require(votes[_voteId].state == State.Stopped);
        _;
    }
  
    function createVote(string _question) public {
        uint256 id = votes.push(Vote(State.Initial, _question, new string[](0))) - 1;
        voteToOwner[id] = msg.sender;
    }

    function startVote(uint256 _voteId) public onlyVoteOwner(_voteId) onlyInitialVote(_voteId) {
        votes[_voteId].state = State.Started;
    }

    function stopVote(uint256 _voteId) public onlyVoteOwner(_voteId) onlyStartedVote(_voteId) {
        votes[_voteId].state = State.Stopped;
    }
  
    function addAnswer(uint256 _voteId, string _answer) public onlyVoteOwner(_voteId) onlyStartedVote(_voteId) {
        votes[_voteId].answers.push(_answer);
    }
}