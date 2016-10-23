(function() {
	var multiplex = Reveal.getConfig().multiplex;
	var socketId = multiplex.id;
	var socket = io.connect(multiplex.url);


	function convertNodeListToArray(nodeList) {
		return Array.prototype.slice.call(nodeList);
	}

	function handleVoteSlide(data) {
		//Given the vote selector, find it, and find which slide to go to

		var voteSelector = data.selector;

		//get vote tage
		var voteEl = document.querySelector(voteSelector);
		if (!voteEl) {
			return;
		}

		var voteParentEl = voteEl.parentNode;
		if (voteParentEl.nodeName !== 'SECTION') {
			return;
		}

		var sectionElementArray = convertNodeListToArray(document.querySelectorAll('section'));
		var index = sectionElementArray.findIndex(function(el) {
			return el === voteParentEl;
		});

		Reveal.slide(index);
	}

	socket.on(multiplex.id, function(data) {

		console.log(data);

		// ignore data from sockets that aren't ours
		if (data.socketId !== socketId) { return; }
		if( window.location.host === 'localhost:1947' ) return;

		if(data.messageType === 'vote') {
			handleVoteSlide(data);
		}

		// Reveal.setState(data.state);
	});
}());
