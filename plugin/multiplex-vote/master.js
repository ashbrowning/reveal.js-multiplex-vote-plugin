(function () {

	// Don't emit events from inside of notes windows
	if (window.location.search.match(/receiver/gi)) { return; }

	var multiplex = Reveal.getConfig().multiplex;

	var socket = io.connect(multiplex.url, {query: 'name=master'});

	socket.on('vote-update', onVoteUpdate);

	function onVoteUpdate(data) {
		var dataKeys = Object.keys(data.votes);
		dataKeys.forEach(function(index) {
			var value = data.votes[index];
			$(Reveal.getCurrentSlide()).find('vote li').eq(index).find('span').html(' - ' + value);
		});
	}

	function convertNodeListToArray(nodeList) {
		return Array.prototype.slice.call(nodeList);
	}

	function getParentSectionId(slideEl) {
		var parentEl = slideEl.parentNode;
		if (parentEl.nodeName !== 'SECTION') {
			console.log('Vote section must have a parent section');
			return null;
		}

		return parentEl.id;
	}

	function onSlideUpdate() {
		var currentSlide = Reveal.getCurrentSlide();

		//Does it have a class of vote, vote-prep or vote-result?
		var classList = convertNodeListToArray(currentSlide.classList);

		if (classList.indexOf('vote-prep') > -1) {
			changeClientSlide(getParentSectionId(currentSlide), 'vote-prep');
		} else if (classList.indexOf('vote') > -1) {
			changeClientSlide(getParentSectionId(currentSlide), 'vote');
		} else if (classList.indexOf('vote-result') > -1) {
			changeClientSlide(getParentSectionId(currentSlide), 'vote-result');
		}
	}

	function changeClientSlide(id, className) {

		var messageData = {
			messageType: 'vote',
			id: id,
			className: className,
			secret: multiplex.secret,
			socketId: multiplex.id
		};

		console.log(messageData);

		socket.emit('multiplex-statechanged', messageData);
	}

	// Monitor events that trigger a change in state
	Reveal.addEventListener('slidechanged', onSlideUpdate);
	// Reveal.addEventListener( 'fragmentshown', post );
	// Reveal.addEventListener( 'fragmenthidden', post );
	// Reveal.addEventListener( 'overviewhidden', post );
	// Reveal.addEventListener( 'overviewshown', post );
	// Reveal.addEventListener( 'paused', post );
	// Reveal.addEventListener( 'resumed', post );

} ());
