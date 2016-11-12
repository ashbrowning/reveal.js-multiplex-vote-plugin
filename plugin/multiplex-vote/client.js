(function () {
	var multiplex = Reveal.getConfig().multiplex;
	var socketId = multiplex.id;
	var socket = io.connect(multiplex.url);


	function convertNodeListToArray(nodeList) {
		return Array.prototype.slice.call(nodeList);
	}

	function getRootSections() {
		var sectionElementArray = convertNodeListToArray(document.querySelectorAll('section'));
		return sectionElementArray.reduce(function (arr, sectionEl) {
			if (sectionEl.parentNode.nodeName !== 'SECTION') {
				arr.push(sectionEl);
			}
			return arr;
		}, []);
	}

	/**
	 * Obtain the h (horizontal) slide index for a given section element
	 * This section element must not be a nested section.
	 */
	function getHIndex(section) {
		var sectionElementArray = convertNodeListToArray(document.querySelectorAll('section'));
		var parentSectionElementArray = getRootSections();

		return parentSectionElementArray.findIndex(function (el) {
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

	function getSectionGivenVoteEl(voteEl) {

	}

	function handleVoteClickEvent(vote, option) {
		console.log(vote + '/' + option);
	}

	function initializeVoteOptions() {
		var voteArray = convertNodeListToArray(document.querySelectorAll('vote'));

		//TODO Convert to array.forEach()
		for (var i = 0; i < voteArray.length; ++i) {
			var voteEl = voteArray[i];
			var voteElVoteIdNode = voteEl.attributes.getNamedItem('data-vote-id');
			if (!voteElVoteIdNode) {
				continue;
			}
			var voteId = voteElVoteIdNode.value;
			var buttonArray = convertNodeListToArray(voteEl.querySelectorAll('button'));
			for (var j = 0; j < buttonArray.length; ++j) {
				var dataAttribute = document.createAttribute('data-option-id');
				dataAttribute.value = j;
				var button = buttonArray[j];
				button.attributes.setNamedItem(dataAttribute);
				(function (optionId) {
					button.addEventListener('click', function () {
						handleVoteClickEvent(voteId, optionId);
					});
				})(j);
			}
		}
	}

	function initializeVoteSections() {
		var sectionArray = getRootSections();

		sectionArray.forEach(function(el) {
			var voteEl = el.querySelector('vote');
			if (!voteEl) {
				return;
			}

			var sectionId = el.id;
			if (!el.id) {
				return;
			}

			var dataAttribute = document.createAttribute('data-vote-id');
			dataAttribute.value = sectionId;
			voteEl.attributes.setNamedItem(dataAttribute);

		});
	}

	initializeVoteSections();

	initializeVoteOptions();


} ());
