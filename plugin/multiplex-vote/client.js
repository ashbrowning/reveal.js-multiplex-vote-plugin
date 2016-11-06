(function () {
	var multiplex = Reveal.getConfig().multiplex;
	var socketId = multiplex.id;
	var socket = io.connect(multiplex.url);


	function convertNodeListToArray(nodeList) {
		return Array.prototype.slice.call(nodeList);
	}

	/**
	 * Obtain the h (horizontal) slide index for a given section element
	 * This section element must not be a nested section.
	 */
	function getHIndex(section) {
		var sectionElementArray = convertNodeListToArray(document.querySelectorAll('section'));
		var parentSecetionElementArray = sectionElementArray.reduce(function (arr, sectionEl) {
			if (sectionEl.parentNode.nodeName !== 'SECTION') {
				arr.push(sectionEl);
			}
			return arr;
		}, []);

		return parentSecetionElementArray.findIndex(function (el) {
			return el === section;
		});
	}

	function getVIndex(parentSection, voteSection) {
		var childEls = convertNodeListToArray(parentSection.querySelectorAll('section'));
		return childEls.findIndex(function (el) {
			return el === voteSection;
		});
	}

	function handleVoteSlide(data) {

		var id = data.id;
		var className = data.className;

		var parentSection = document.querySelector('#' + id);

		if (!parentSection) {
			return;
		}

		var voteSection = parentSection.querySelector('.' + className);

		if (!voteSection) {
			return;
		}

		var hIndex = getHIndex(parentSection);
		var vIndex = getVIndex(parentSection, voteSection);

		Reveal.slide(hIndex, vIndex);


		//Given the vote selector, find it, and find which slide to go to

		// var voteSelector = data.selector;

		// //get vote tage
		// var voteEl = document.querySelector(voteSelector);
		// if (!voteEl) {
		// 	return;
		// }

		// var voteParentEl = voteEl.parentNode;
		// if (voteParentEl.nodeName !== 'SECTION') {
		// 	return;
		// }

		// var sectionElementArray = convertNodeListToArray(document.querySelectorAll('section'));
		// var index = sectionElementArray.findIndex(function(el) {
		// 	return el === voteParentEl;
		// });

		// Reveal.slide(index);
	}

	socket.on(multiplex.id, function (data) {

		console.log(data);

		// ignore data from sockets that aren't ours
		if (data.socketId !== socketId) { return; }
		if (window.location.host === 'localhost:1947') return;

		if (data.messageType === 'vote') {
			handleVoteSlide(data);
		}

		// Reveal.setState(data.state);
	});
} ());
