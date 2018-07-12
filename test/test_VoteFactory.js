var VoteFactory = artifacts.require("./VoteFactory.sol");

let CorrectQuestion = "New Question"
let CorrectAnswer = "NewAnswer"

contract('VoteFactory', async (accounts) => {

  it("should create new vote"),  async () => {
    let voteFactory = await VoteFactory.deployed();
    await voteFactory.createVote(CorrectQuestion);
    let createdVote = await voteFactory.votes[0].question;
    assert.equal(createdVote, CorrectQuestion, "");
  }

  it("should add new answer to vote"),  async () => {
    let voteFactory = await VoteFactory.deployed();
    await voteFactory.createVote(CorrectQuestion);
    await voteFactory.addAnswer(0, CorrectAnswer);
    let createdAnswer = await voteFactory.votes[0].answers[0];
    assert.equal(createdAnswer, CorrectAnswer, "");
  }
});
