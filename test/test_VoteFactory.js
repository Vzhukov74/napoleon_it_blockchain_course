//require('babel-register');
//require('babel-polyfill');

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

  beforeEach('setup contract for each test', async function() {
    voteFactory = await VoteFactory.new({from: owner});
  });

  it("should create new vote"),  async function() {
    await voteFactory.createVote(CorrectQuestion, {from: creator});
    let createdVote = await voteFactory.votes[0].question;
    assert.equal(createdVote, CorrectQuestion, "");
  }

  it("should add new answer to vote"),  async function() {
    await voteFactory.createVote(CorrectQuestion, {from: creator});
    await voteFactory.addAnswer(0, CorrectAnswer, {from: creator});
    let createdAnswer = await voteFactory.votes[0].answers[0];
    assert.equal(createdAnswer, CorrectAnswer, "");
  }

  it("should add new answer to a stranger vote"),  async function() {
    await voteFactory.createVote(CorrectQuestion, {from: creator});
    await expectThrow(voteFactory.addAnswer(0, answer0, {from: user}));
  }
});
