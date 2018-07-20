pragma solidity ^0.4.24;

import "./Ownable.sol";

contract VoteFactory is Ownable {
  
    uint256 constant public maximumPossibleVotes = 10000000;
  
    enum State {
        Initial,
        Started,
        Stopped
    }

    struct Answer {
        string answer;
        uint256 count;
    }

    struct Vote {
        State state;
        uint256 maximumPossibleVotes;
        string question;
        mapping (address => uint256) ownerToAnswerId;
    } 
  
    Vote[] public votes;
    mapping (uint256 => address) voteToOwner;
    mapping (uint256 => Answer[]) voteIdToAnswers;
    
    // modifiers 
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
    
    modifier onlyVotesCountLessThanMaximum(uint256 _voteId) {
        uint256 total = 0;
        for(uint32 index = 0; index<voteIdToAnswers[_voteId].length; index++) {
            total += voteIdToAnswers[_voteId][index].count;
        }
        require(votes[_voteId].maximumPossibleVotes < total);
        _;
    }

    // vote state manipulators 
    function startVote(uint256 _voteId) public onlyVoteOwner(_voteId) onlyInitialVote(_voteId) {
        votes[_voteId].state = State.Started;
    }

    function stopVote(uint256 _voteId) public onlyVoteOwner(_voteId) onlyStartedVote(_voteId) {
        votes[_voteId].state = State.Stopped;
    }

    // vote
    function createVote(string _question) public {
        uint256 id = votes.push(Vote(State.Initial, maximumPossibleVotes, _question)) - 1;
        voteToOwner[id] = msg.sender;
    }

    function setQuestion(uint256 _voteId, string _question) public onlyVoteOwner(_voteId) onlyInitialVote(_voteId) {
        votes[_voteId].question = _question;
    }

    function addAnswer(uint256 _voteId, string _answer) public onlyVoteOwner(_voteId) onlyInitialVote(_voteId) {
        voteIdToAnswers[_voteId].push(Answer(_answer, 0));
    }

    function setAnswer(uint256 _voteId, uint256 _answerId, string _answer) public onlyVoteOwner(_voteId) onlyInitialVote(_voteId) {
        voteIdToAnswers[_voteId][_answerId].answer = _answer;
    }
    
    function setMaximumPossibleVotesFor(uint256 _voteId, uint256 _maximumPossibleVotes) public onlyVoteOwner(_voteId) onlyInitialVote(_voteId) {
        votes[_voteId].maximumPossibleVotes = _maximumPossibleVotes;
    }

    function cast(uint256 _voteId, uint256 _answerId) public onlyStartedVote(_voteId) {
        if (votes[_voteId].ownerToAnswerId[msg.sender] == 0) {
            votes[_voteId].ownerToAnswerId[msg.sender] = _answerId;
            voteIdToAnswers[_voteId][_answerId].count = voteIdToAnswers[_voteId][_answerId].count + 1;
        } else {
            uint256 previousAnswerId = votes[_voteId].ownerToAnswerId[msg.sender];  
            voteIdToAnswers[_voteId][previousAnswerId].count = voteIdToAnswers[_voteId][previousAnswerId].count - 1;
            
            votes[_voteId].ownerToAnswerId[msg.sender] = _answerId;
            voteIdToAnswers[_voteId][_answerId].count = voteIdToAnswers[_voteId][_answerId].count + 1;
        }
    }

    function results(uint256 _voteId) public view returns(uint256) {
        uint256 max = 0;
        uint256 winner = 0;
        
        for(uint256 index = 0; index < voteIdToAnswers[_voteId].length; index++) {
            if (max < voteIdToAnswers[_voteId][index].count) {
                max = voteIdToAnswers[_voteId][index].count;
                winner = index;
            }
        }
        
        return winner;
    }

    // helper 
    function answerFor(uint256 _voteId, uint256 _answerId) public view returns(string) {
        return voteIdToAnswers[_voteId][_answerId].answer;
    }

    function questionFor(uint256 _voteId) public view returns(string) {
        return votes[_voteId].question;
    }
}