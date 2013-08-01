$(document).ready(function(){
	console.log("hello.");

	// Table init
	
	var trackPrefix = "";
	var ROW_COUNT = 3, 
		COL_COUNT = 3;
	
	var audio = [],
		
		playingQue = {};
		playingQue.queue = [];

		playingQue.setOrder = function(col, row){
			this.queue[col] = row;

			$("#c"+col+" .filler").removeClass("queued");
			$("#r"+row+" #c"+col+" .filler").addClass("queued");
		};
		playingQue.getRow = function(col){
			return this.queue[col];
		};


	var zong = $("#zong");
	var nowPlayingProto = { i: 0, j: 0, cell: null, seeker: null};
		nowPlayingProto.getAudio = function(){
			return audio[this.i][this.j];
		};
		nowPlayingProto.setPiece = function(i, j){
			this.i = i;
			this.j = j;
			this.cell = $('#zong #r'+i+' #c'+j)[0];
			this.seeker = $(this.cell).children(".seeker")[0];

			return this.cell;
		};

	var nowPlaying = Object.create(nowPlayingProto);

		


	for (var i = 0; i < ROW_COUNT; i++) {
		
		audio[i] = [];
		var currentTr = $('<tr id="r'+i+'"></tr>');
		zong.append(currentTr);

		for (var j = 0; j < COL_COUNT; j++) {
			var currentTd = $('<td id="c'+j+'"><div class="seeker"></div><div class="filler" >'+i+j+'</div></td>');
			currentTr.append(currentTd);


			audio[i][j] = $('<audio src="audio/'+trackPrefix+i+j+'.wav"></audio>')[0];
			
			if(j != 0){
				toggleNextPiece(i, j-1);
			}

			(function (currentTd) {
				$(currentTd).click(selectInColumn);
			})(currentTd);

		}
	};

	playingQue.setOrder(0, 1);
	playingQue.setOrder(1, 0);
	playingQue.setOrder(2, 2);

	nowPlaying.setPiece(playingQue.getRow(0),0);

	// Stop all
	
	$("#stop-all").click(function(){

		nowPlaying.getAudio().pause();

		clearTimeout(nowPlayingTimer);
		clearTimeout(moveSeekerTimer);
	}); 
	$("#play-pause").click(function(){
		var audioPiece = nowPlaying.getAudio();
		
		if(audioPiece.paused){

			audioPiece.play();
			$(this).html('<i class="icon-pause icon-white"></i>');
			$(this).addClass('active');
		} else {
			
			audioPiece.pause();
			clearTimeout(nowPlayingTimer);
			clearTimeout(moveSeekerTimer);
			$(this).html('<i class="icon-play icon-white"></i>');
			$(this).removeClass('active');
		}
	});     
	function selectInColumn(){
		var td = this;

		var row = $(td).parent().attr("id").slice(1)|0,
			col = $(td).attr("id").slice(1)|0;

		playingQue.setOrder(col, row);

	}
	function playAndMove(td){
		if(!td) { var td = this; }

		console.log(td)
	
		var j = $(td).attr("id").slice(1)|0;
		var i = $(td).parent().attr("id").slice(1)|0;

		console.log(i,j);
		stopAllPieces();

		nowPlaying.setPiece(i,j);
		nowPlaying.getAudio().play();

		$(this).addClass("active");

	}

	function stopAllPieces(){

			audio.forEach(function(ai, r){
				ai.forEach(function(aij, c){

					aij.currentTime = 0;
					aij.pause();
					
					$('#zong #r'+r+' #c'+c+'').removeClass("active");

				});
			});
	}

	var nowPlayingTimer = 0, moveSeekerTimer = 0;

	function toggleNextPiece(i, j){

		var cur = audio[i][j];
		
		cur.addEventListener("play", function(){

			var playAfter = (this.duration - this.currentTime ) * 1000;
			
			clearTimeout(nowPlayingTimer);

			nowPlayingTimer = setTimeout(function(){

				stopAllPieces();
				var row = playingQue.getRow(j+1);
				nowPlaying.setPiece(row,j+1);
				nowPlaying.getAudio().play();
				console.log(nowPlaying.getAudio())

				$('#zong #r'+row+' #c'+(j+1)+'').addClass("active");

			}, playAfter - 4 );

			moveSeeker();

		}, false);
	}

	function moveSeeker(){
		var cell = nowPlaying.cell,
			cellLength = $(cell).width(),
			audioPiece = nowPlaying.getAudio();
		// var cellLength = $('#zong #r'+nowPlaying.i+' #c'+nowPlaying.j).width();
		
		var oneSecondLength = cellLength / audioPiece.duration,
			currentPosition = audioPiece.currentTime * oneSecondLength,

			currentMargin = currentPosition - cellLength;

		$(nowPlaying.seeker).css('marginLeft', currentMargin);

		moveSeekerTimer = setTimeout(function(){
				moveSeeker();
				
		}, 100);				

	}

	// $("#zong #r1 #c1").click();
});
