const config = require("./config.json");
const DataManagerConstructor = require("./datamanager.js");
const DataManager = new DataManagerConstructor(config.dataFile);

function Leaderboard(server, config) {
	this.data = DataManager.getData();
	//this.server = server;
	//this.page = config.page || 1;
	//this.type = config.type || null;
}

Leaderboard.prototype.getList = function(guild, variant, source, active) {
  let tally = DataManager.getData();
  console.log(variant, source, active);
  let sourceratings = source + "ratings";
  let leaderboard = {};
  leaderboard.source = source;
  leaderboard.variant = variant;
  leaderboard.active = active;
  leaderboard.list = [];
	for(let i = 0; i < tally.length; i++) {
    let dbuser = tally[i];
    let entry = {};
    if(active && (!dbuser.lastmessagedate || Date.now() - dbuser.lastmessagedate > 604800000)) return;
    if(dbuser[source] && dbuser[sourceratings] && dbuser[sourceratings][variant] && !dbuser[sourceratings][variant].endsWith("?")) {
      entry.username = dbuser[source];
      entry.userid = dbuser.id;
      entry.rating = dbuser[sourceratings][variant];
      leaderboard.list.push(entry);
    }
  };
  if(leaderboard.length === 0) return;
	leaderboard.list.sort(function(a, b) {
		return parseInt(b.rating) - parseInt(a.rating);
  });
  return leaderboard;
};

/*
	let perPage = 10;
	let pages = Math.ceil(collectedUsers.length / perPage);
	if(this.page > pages) {
		this.page = pages;
	} else if(this.page < 1) {
		this.page = 1;
	}
	let output = {
		"embed": {
			"title": "Current standings (page " + this.page + "/" + pages + ")",
			"description": ""
		}
	};

	let startPos = this.page * perPage - perPage;
	let endPos = startPos + perPage;
	let userMaxType = null;
	for(let i = startPos; i < collectedUsers.length && i < endPos; i++) {
		let nick = getNick(collectedUsers[i].serverID, collectedUsers[i].userID);
		let username = collectedUsers[i].username;
		let source = collectedUsers[i].source;
		if(this.type === null) {
			userMaxType = collectedUsers[i].type;
		}
		let url = null;
		if(source === "Chesscom") {
			url = settings.chesscomProfileURL.replace("|", username);
		} else if(source === "Lichess") {
			url = settings.lichessProfileURL.replace("|", username);
		}
		let rating = collectedUsers[i].rating;
		output.embed.description += (i + 1) + ": **" + rating + "** " + nick +
			" (" + (userMaxType || this.type) + ") (" + url + ")\n";
	}

	return output;
};

*/

Leaderboard.prototype.getRank = function(getNick, userID) {
	let userData = null;
	let serverID = null;
	for(servID in this.data) {
		if(this.data[servID][userID]) {
			userData = this.data[servID][userID];
			serverID = servID;
			break;
		}
	}
	if(!userData) {
		return "Could not find your ranking, you are not being tracked.";
	}
	let maxArray = [];
	let bulletArray = [];
	let blitzArray = [];
	let rapidArray = [];
	let classicalArray = [];
	for(let uid in this.data[serverID]) {
		if(this.data[serverID][uid].ratings.classical) {
			classicalArray.push(this.data[serverID][uid].ratings.classical);
		}
		if(this.data[serverID][uid].ratings.rapid) {
			rapidArray.push(this.data[serverID][uid].ratings.rapid);
		}
		if(this.data[serverID][uid].ratings.blitz) {
			blitzArray.push(this.data[serverID][uid].ratings.blitz);
		}
		if(this.data[serverID][uid].ratings.bullet) {
			bulletArray.push(this.data[serverID][uid].ratings.bullet);
		}
		maxArray.push(this.data[serverID][uid].ratings.maxRating);
	}
	classicalArray.sort(function(a, b){
		return b - a;
	});
	rapidArray.sort(function(a, b){
		return b - a;
	});
	blitzArray.sort(function(a, b){
		return b - a;
	});
	bulletArray.sort(function(a, b){
		return b - a;
	});
	maxArray.sort(function(a, b){
		return b - a;
	});
	let cRating = userData.ratings.classical ? classicalArray.indexOf(userData.ratings.classical)+1 : null;
	let rRating = userData.ratings.rapid ? rapidArray.indexOf(userData.ratings.rapid)+1 : null;
	let bRating = userData.ratings.blitz ? blitzArray.indexOf(userData.ratings.blitz)+1 : null;
	let buRating = userData.ratings.bullet ? bulletArray.indexOf(userData.ratings.bullet)+1 : null;
	let maxRating = userData.ratings.maxRating ? maxArray.indexOf(userData.ratings.maxRating)+1 : null;
	let output = {
		"embed": {
			"title": "Rating positions for: " + getNick(serverID, userID),
			"description": ""
		}
	};
	output.embed.description += "Overall: **" + userData.ratings.maxRating + "** (#" + maxRating + ")\n";
	if(userData.ratings.classical) {
		output.embed.description += "Classical: **" + userData.ratings.classical + "** (#" + cRating + ")\n";
	}
	if(userData.ratings.rapid) {
		output.embed.description += "Rapid: **" + userData.ratings.rapid + "** (#" + rRating + ")\n";
	}
	if(userData.ratings.blitz) {
		output.embed.description += "Blitz: **" + userData.ratings.blitz + "** (#" + bRating + ")\n";
	}
	if(userData.ratings.bullet) {
		output.embed.description += "Bullet: **" + userData.ratings.bullet + "** (#" + buRating + ")\n";
	}

	return output;
};
module.exports = Leaderboard;