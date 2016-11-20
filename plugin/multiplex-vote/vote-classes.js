'use strict';

class VoteCounter {
  constructor() {
    this.votes = {};
  }

  handleVote(voteId, option) {
    if (!this.votes[voteId]) {
      this.votes[voteId] = new Vote(voteId);
    }
    this.votes[voteId].addVote(option);
  }

  getVoteTally(voteId) {
    return (this.votes[voteId] && this.votes[voteId].voteTally) || {};
  }
}

class Vote {
  constructor(name) {
    this.name = name;
    this.voteTally = {};
  }

  addVote(option) {
    if (this.voteTally[option]) {
      this.voteTally[option] += 1;
    } else {
      this.voteTally[option] = 1;
    }
    console.log(this.name, this.voteTally);
  }
}

module.exports = VoteCounter;
