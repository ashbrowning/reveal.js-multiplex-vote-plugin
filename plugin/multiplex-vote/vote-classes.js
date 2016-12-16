'use strict';

class VoteCounter {
  constructor() {
    this.votes = {};
  }

  handleVote(voteId, option, clientId) {
    if (!this.votes[voteId]) {
      this.votes[voteId] = new Vote(voteId);
    }
    this.votes[voteId].addVote(option, clientId);
  }

  getVoteTally(voteId) {
    const vote = this.votes[voteId] || {};
    const clientIds = Object.keys(vote.voteTally);
    const tally = {};
    for (let i = 0; i < clientIds.length; ++i) {
      const client = clientIds[i];
      const option = vote.voteTally[client];
      if (tally[option] === undefined) {
        tally[option] = 1
      } else {
        tally[option] += 1;
      }
    }

    console.log('tally', tally);
    return tally;
  }
}

class Vote {
  constructor(name) {
    this.name = name;
    this.voteTally = {};
  }

  addVote(option, clientId) {
    this.voteTally[clientId] = option;
    console.log(this.name, this.voteTally);
  }
}

module.exports = VoteCounter;
