(function() {

	// Don't emit events from inside of notes windows
	if ( window.location.search.match( /receiver/gi ) ) { return; }

	var multiplex = Reveal.getConfig().multiplex;

	var socket = io.connect( multiplex.url );

	function post() {

		var messageData = {
			state: Reveal.getState(),
			secret: multiplex.secret,
			socketId: multiplex.id
		};

		socket.emit( 'multiplex-statechanged', messageData );

	};


	function onSlideUpdate() {
		var currentSlide = Reveal.getCurrentSlide();

		//Try to get the first vote tag
		var voteEl = currentSlide.querySelector('vote');

		if(voteEl) {
			processVoteEl(voteEl);
		}

		//querySelectorAll
	}

	function processVoteEl(voteEl) {

		//get ID of vote tag, pass message to client
		var id = '#' + voteEl.id;
		//could do it via order index?

		var messageData = {
			messageType: 'vote',
			selector: id,
			secret: multiplex.secret,
			socketId: multiplex.id
		};

		console.log(messageData);

		socket.emit('multiplex-statechanged', messageData);
	}

	// Monitor events that trigger a change in state
	Reveal.addEventListener( 'slidechanged', onSlideUpdate );
	// Reveal.addEventListener( 'fragmentshown', post );
	// Reveal.addEventListener( 'fragmenthidden', post );
	// Reveal.addEventListener( 'overviewhidden', post );
	// Reveal.addEventListener( 'overviewshown', post );
	// Reveal.addEventListener( 'paused', post );
	// Reveal.addEventListener( 'resumed', post );

}());
