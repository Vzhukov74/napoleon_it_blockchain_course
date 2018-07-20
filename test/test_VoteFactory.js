//const BigNumber = web3.BigNumber;
//var ethUtil = require('ethereumjs-util')
//var Tx = require('ethereumjs-tx');
//const expect = require('chai').expect;
//const should = require('chai')
//    .use(require('chai-as-promised'))
//    .use(require('chai-bignumber')(web3.BigNumber))
//    .should();

import expectThrow from './helpers/expectThrow';

var VoteFactory = artifacts.require("./VoteFactory.sol");

contract('VoteFactory', function(accounts) {
  var voteFactory;

  const owner = accounts[0];
  const creator = accounts[1];
  const user = accounts[2];

  const CorrectQuestion = "New Question"
  const CorrectAnswer = "NewAnswer"
  const CorrectAnswer2 = "NewAnswer2"

  beforeEach('setup contract for each test', async function() {
    voteFactory = await VoteFactory.new({from: owner});
  });

  it ("checks created vote", async function() {
    await voteFactory.createVote(CorrectQuestion, {from: creator});
    let question = await voteFactory.questionFor(0, {from: creator});
    assert.equal(question, CorrectQuestion, "");
  });

  it ("checks answers flow", async function() {
    await voteFactory.createVote(CorrectQuestion, {from: creator});
    await voteFactory.addAnswer(0, CorrectAnswer, {from: creator});
    var answer = await voteFactory.answerFor(0, 0, {from: creator});
    assert.equal(answer, CorrectAnswer, "");

    await voteFactory.addAnswer(0, CorrectAnswer2, {from: creator});
    var answer = await voteFactory.answerFor(0, 1, {from: creator});
    assert.equal(answer, CorrectAnswer2, "");
    var answer = await voteFactory.answerFor(0, 0, {from: creator});
    assert.equal(answer, CorrectAnswer, "");

    await voteFactory.setAnswer(0, 0, CorrectAnswer2, {from: creator});
    var answer = await voteFactory.answerFor(0, 0, {from: creator});
    assert.equal(answer, CorrectAnswer2, "");
    var answer = await voteFactory.answerFor(0, 1, {from: creator});
    assert.equal(answer, CorrectAnswer2, "");
  });

  it ("checks vote access", async function() {
    //here vote will be in initial state 
    await voteFactory.createVote(CorrectQuestion, {from: creator});

    await expectThrow(voteFactory.addAnswer(0, CorrectAnswer, {from: owner}));
    await expectThrow(voteFactory.setAnswer(0, 0, CorrectAnswer, {from: owner}));
    await expectThrow(voteFactory.setMaximumPossibleVotesFor(0, 10, {from: owner}));
    await expectThrow(voteFactory.startVote(0, {from: owner}));

    await voteFactory.startVote(0, {from: creator});
  });

  it ("checks vote state flow", async function() {
    //here vote will be in initial state 
    await voteFactory.createVote(CorrectQuestion, {from: creator});
    await voteFactory.addAnswer(0, CorrectAnswer, {from: creator});
    await voteFactory.addAnswer(0, CorrectAnswer, {from: creator});
    await voteFactory.setAnswer(0, 0, CorrectAnswer, {from: creator});
    await voteFactory.setMaximumPossibleVotesFor(0, 10, {from: creator});
    
    await expectThrow(voteFactory.cast(0, 0, {from: creator}));
    await expectThrow(voteFactory.stopVote(0, {from: creator}));
    //set answer in started state
    await voteFactory.startVote(0, {from: creator});

    await expectThrow(voteFactory.addAnswer(0, CorrectAnswer, {from: creator}));
    await expectThrow(voteFactory.setAnswer(0, 0, CorrectAnswer, {from: creator}));
    await expectThrow(voteFactory.setMaximumPossibleVotesFor(0, 10, {from: creator}));

    await voteFactory.cast(0, 0, {from: creator})

    //set answer in stopped state
    await voteFactory.stopVote(0, {from: creator});

    await expectThrow(voteFactory.addAnswer(0, CorrectAnswer, {from: creator}));
    await expectThrow(voteFactory.setAnswer(0, 0, CorrectAnswer, {from: creator}));
    await expectThrow(voteFactory.setMaximumPossibleVotesFor(0, 10, {from: creator}));
    await expectThrow(voteFactory.cast(0, 0, {from: creator}));
    await expectThrow(voteFactory.startVote(0, {from: creator}));
  });

  it ("checks voting process", async function() {
    //here vote will be in initial state 
    await voteFactory.createVote(CorrectQuestion, {from: creator});
    await voteFactory.addAnswer(0, CorrectAnswer, {from: creator});
    await voteFactory.addAnswer(0, CorrectAnswer, {from: creator});
    await voteFactory.startVote(0, {from: creator});

    await voteFactory.cast(0, 0, {from: creator});

    //TO DO: add valid verification for empty value for mapping voteIdToAnswers in contract!
    // await voteFactory.cast(0, 0, {from: creator});
    // await voteFactory.cast(0, 0, {from: creator});
    // await voteFactory.cast(0, 0, {from: creator});

    await voteFactory.cast(0, 1, {from: owner});
    await voteFactory.cast(0, 1, {from: user});

    var resultId = await voteFactory.results(0);
    assert.equal(resultId.toNumber(), 1, "");
    
    await voteFactory.cast(0, 0, {from: user});

    var resultId = await voteFactory.results(0);
    assert.equal(resultId.toNumber(), 0, "");
  });
});