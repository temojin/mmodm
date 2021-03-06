window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var samples = [];
var loader=0;

tracks.forEach(function(track, i, arr){
	loadSample(i,'samples/'+track.filename);
})

function loadSample(id, url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	// Decode asynchronously and push to samples
	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
			buffer.id=id;
			samples.push(buffer);
			incLoader(loader++)
		}, function(err){});
	}
	request.send();

}

function incLoader(loader){
	if(loader == tracks.length-1)
		return samplesLoaded(samples);
	}

function playSound(buffer,type,freq) {
	var source = context.createBufferSource();
	if(typeof(buffer)=='object'){
		source.buffer = buffer;
		if(type){
			var filter = context.createBiquadFilter();
			filter.type = type;
			filter.frequency.value = freq;
			source.connect(filter);
			filter.connect(context.destination);
			this.filter = filter;
		}
		else
			source.connect(context.destination);
			source.start(0);
		}
}

function samplesLoaded(samples){
	samples.sort(function (a, b) {
		if (a.id < b.id) {
			return -1;
		}
		else if (a.id > b.id) {
			return 1;
		}
		return 0;
	});
}

// Seeding random "data" so that it doesn't look bad while I'm coding
function seed() {
	// Human starter
	playKeys(["o","-","-","-","o","-","-","-","o","-","-","-","o","-","-","-"]);

	if (!$('.o').hasClass('locked')) {
		lockColumn(14);
	}

	if ($('.save').hasClass('saved')) {
		$('.save').removeClass('saved');
		saveState = [];
		undoSave = [];
		$('.save').tooltipster('destroy');
		$('.save').tooltipster({'content': 'Save & Share'});
	}

	// Random filler
	for (var tweets=1; tweets<2; tweets++) {
		var seedArray = [];
		var randomOff = [];
		for (var i=0; i<13; i++) {
			randomOff.push(Math.floor(Math.random() * (26)));
		}
		for (var i=0; i<40; i++) {
			var randomLetter = Math.floor(Math.random() * (27));
			if ($.inArray(randomLetter, randomOff) < 0) {
				seedArray.push(letters[randomLetter]);
			}
		}
		playKeys(seedArray);
	}
}

function startIntro() {
	for (var k=0; k<83; k++) {
		for (var i=0; i<16; i++) {
			for (var j=0; j<26; j++) {
				var l = j + k;
				$('.sequences ul:not(.locked):nth-child(' + (j+1) + ') li:nth-child(' + (i+1) + ') span').delay(0).animate({'opacity': intro[i][l]}, 0);
			}
		}
	}
}

function smileFace() {
	$.each(smile, function(index, value) {
		lightObject(smile[index][0], smile[index][1]);
	});
}

function lightObject(x, y){
	$('.sequences ul:not(.locked):nth-child(' + x + ') li:nth-child(' + y + ') span').css({'opacity': 1}).attr('data-life', (life * ((tempo * 4) / 60)) / 16);
	// .animate({'opacity': 0.125}, death);
	$('.stream ul:last-child').append('<li class="' + letters[x] + '"></li>');
}

function fadeObject(object, opacity){
	var item = object;
	var currentOpacity = item.css('opacity');
	item.css({'opacity': currentOpacity - opacity});
}

function offObject(x, y){
	$('.sequences ul:not(.locked):nth-child(' + x + ') li:nth-child(' + y + ') span').css({'opacity': 0.125}).attr('data-life', 0);
}

function Create2DArray(rows) {
	var arr = [];

	for (var i=0;i<rows;i++) {
		arr[i] = [];
	}

	return arr;
}

function playKeysURL(seed) {
	$('.stream').append('<ul></ul>');
	setTimeout(function() {
		$('.stream ul:first-child').remove();
	},10000);

	var re = /(\-*\w)/g
	var strSeed = seed.join('')
	var seed = strSeed.match(re);
	var sst = Create2DArray(26);
	var x = 0;

	for(var i=0; i<seed.length; i++){
		for(var j = 0; j<tracks.length; j++){
			if(seed[i].match(tracks[j].name)) sst[tracks[j].id].push(seed[i]);
		}
	}

	for(var i=0; i<sst.length; i++){
		var dist=0;
		for(var j=0; j<sst[i].length; j++){
			dist += sst[i][j].length;
			if (sst[i][j] != 0) {
				lightObject(i+1,dist%17);
			}
		}
	}
}

function playKeys(seed) {
	$('.stream').append('<ul></ul>');
	setTimeout(function() {
		$('.stream ul:first-child').remove();
	},10000);

	var re = /(\-*\w)/g
	var strSeed = seed.join('');
	var seed = strSeed.match(re).join('').split('');
	var sst = Create2DArray(26);
	var x = 0;

	for(var i=0; i<seed.length; i++){
		for(var j = 0; j<tracks.length; j++){
			if (seed[i].match(tracks[j].name)) {
				sst[tracks[j].id].push(i%16+1);
			} else {
				sst[tracks[j].id].push(0);
			}
		}
	}

	for(var i=0; i<sst.length; i++){
		for(var j=0; j<sst[i].length; j++){
			if (sst[i][j] != 0) {
				lightObject(i+1,sst[i][j]);
			}
		}
	}
}

function tweet(data){
	var request = new XMLHttpRequest();
	request.onreadystatechange = function (oEvent) {
		if (request.readyState === 4) {
			if (request.status === 200) {
				console.log(request.responseText)
			} else {
				console.log("Error", request.statusText);
			}
		}
	};
	var room = document.location.pathname.split('/')[1];
	if(!room)
		request.open('GET', '/tweet/'+data+'%20%23MMODM', true);
	else
		request.open('GET', '/tweet/'+data+'%20%23'+room+'%20%23MMODM', true);
	request.send();
}

$(document).ready(function() {
	if ($('.sequences li span[data-life!="0"]').length == 0) {
		$.getJSON( "tws/5", function( data ) {
			playKeys(data.split(''));
		});
		playKeys(["o","-","-","-","o","-","-","-","o","-","-","-","o","-","-","-"]);
	}
	//Get Keys from URL
	if(document.location.hash != undefined && document.location.hash.length){
		var introSeed = document.location.hash.split('#')[1].split('');
		document.location.hash=''
		playKeysURL(introSeed);
	}
	inputting = 0;
	keyboardShortcuts();
	var inputField = $("#simForm input:text");
	inputField.on('focus',function(e){
		e.preventDefault();
		inputting = 1;
	}).on('focusout', function(e) {
		inputting = 0;
	});

	//Demo Hack
	var userHandler = $('#simForm img').attr('alt')
	$('#simForm').on('submit', function(e){
		e.preventDefault();
		var data = inputField.val()

		if(userHandler != 'MMODM'){
			var hasHashtag = false;
			var hasBrackets = false;
			var mmodmTagPos=1;
			var tweetMsg = data.split("#");
			var tweetLen = tweetMsg.length;

			if(tweetLen >= 1){
				for(var i = 0; i< tweetLen; i++){
					if(tweetMsg[i] == "MMODM") {
						hasHashtag = true;
						mmodmTagPos = i;
					}
				}
			}

			if(tweetMsg[0].length > 1){
				hasBrackets = tweetMsg[0].match(/\[.*\]/);
				if(!hasBrackets){
					tweet(Math.random().toString(36).slice(2).substr(2,8)+" ["+tweetMsg[0]+"]");
					console.log(" ["+tweetMsg[0]+"]");
				}
				else{
					tweet(Math.random().toString(36).slice(2).substr(2,8)+" "+tweetMsg[0]);
					console.log(tweetMsg[0]);
				}

			}
		}
		else {
			if (data == "seed") {
				seed();
			} else if (data == "intro") {
				startIntro();
			} else if ($.grep(beats, function(e){return e.name == data}).length > 0) {
				$.each(beats, function(index, value) {
					if (beats[index].name == data) {
						playKeys(beats[index].sequence.split(''));
					}
				});
			} else {
				playKeys(data.split(''));
			}
		}
		inputField.val('');
	})

	uiEvents();

	play();
});

//Setting up basic timing & loop variables

var mainLoop;
var state = 'stopped';
var time = 1;
var tempo = 120;
var fxpass = 0;

// Basic functions for pulse

function pulse(object) {
	object.addClass('pulse').on('webkitAnimationEnd animationend', function() {
		$(this).removeClass('pulse').off('webkitAnimationEnd animationend');
	});
	object.parent().find('.label').addClass('glow').on('webkitAnimationEnd animationend', function() {
		$(this).removeClass('glow').off('webkitAnimationEnd animationend');
	});
	if (stutterState == 0 && !object.parent().parent().hasClass('locked')) {
		var objectLife = object.attr('data-life');
		if (objectLife <= 1) {
				objectLife = 0;
				offObject(object.parent().parent().index()+1, object.parent().index()+1);
		} else if (objectLife > 0) {
			objectLife--;
			object.attr('data-life', objectLife);
		}
		if (objectLife < 3 && objectLife >= 1) {
			fadeObject(object, .35);
		}
	}
}

var asciiArt = ['(≧◡≦)','(>‿◠)','(¬‿¬)','(^,^)','(─‿─)','(►.◄)','(◕‿◕)'];
var asciiTemp = asciiArt;
var cu = 0;

function urlAscii(i){
	if(tracks[i-1].name=='o'){
		document.location.hash=asciiArt[cu%(asciiArt.length-1)]
		cu++;
	}
}

function row() {
	for (var i=1; i<27; i++) {
		var object = $('.sequences ul:nth-child(' + i + ') li:nth-child(' + time + ') span');
		if (object.attr('data-life') > 0) {
			pulse(object);
			//urlAscii(i);
			playSound(samples[i-1],false,false);
		}
	}
}

	function rowFilter(type, freq){
	for (var i=1; i<27; i++) {
		var object = $('.sequences ul:nth-child(' + i + ') li:nth-child(' + time + ') span');
		if (object.attr('data-life') > 0) {
			pulse(object);
			playSound(samples[i-1],type,freq)
		}
	}
}



// Getter/Setter Effects functions

var gaterState = 0;
var gcounter = 0;

function gater(gate) {
	// Options are (1) 1/2, (2) 2/3
	if (gate > -1) {
		gaterState = gate;
		gcounter = 0;
		$('.gater .button').removeClass('on');
		if (gaterState == 0) {
			$('.gater .none').addClass('on');
		} else if (gaterState == 1) {
			$('.gater .half').addClass('on');
		} else if (gaterState == 2) {
			$('.gater .third').addClass('on');
		}
	} else {
		return gaterState;
	}
}

var stutterState = 0;
var scounter = 0;
var ssplit = 1;

function stutter(stut) {
	// Options are (1) 1, (2) 1/2, (3) 1/4, (4) 1/8
	if (stut > -1) {
		stutterState = stut;
		$('.stutter .button').removeClass('on');
		if (stutterState == 0) {
			ssplit = 1;
			$('.stutter .none').addClass('on');
		} else if (stutterState == 1) {
			ssplit = 1;
			$('.stutter .full').addClass('on');
		} else if (stutterState == 2) {
			ssplit = 2;
			$('.stutter .half').addClass('on');
		} else if (stutterState == 3) {
			ssplit = 4;
			$('.stutter .quarter').addClass('on');
		} else if (stutterState == 4) {
			ssplit = 8;
			$('.stutter .eighth').addClass('on');
		}
		play();
	} else {
		return stutterState;
	}
}

// Beat function computes gater effect

function beat() {
	if (gater() == 1) {
		if (gcounter < 1) {
			gcounter++;
		} else {
			row();
			gcounter = 0;
		}
	} else if (gater() == 2) {
		if (gcounter < 2) {
			gcounter++;
		} else {
			row();
			gcounter = 0;
		}
	} else {
			row();
	}
}

// Play is main timing loop

function play(newTempo) {
	if (newTempo != tempo) {
		if (newTempo > 0) {
			tempo = newTempo;
		}
	}
	if (tempo > 0) {
		if (state == 'paused') {
			for (var i=1; i<27; i++) {
				$('.sequences ul:nth-child(' + i + ') li:nth-child(' + time + ') span').removeClass('paused');
			}
			if (time > 15) {
				time = 1;
			} else {
				time++;
			}
		} else if (state == 'playing') {
			clearInterval(mainLoop);
		}
		$('.off').removeClass('off');
		$('.play').addClass('off');
		$('.pauseplay').tooltipster('content', 'Pause');
		mainLoop = setInterval(function() {
			var percentFilled = $('.sequences li span[data-life!="0"]').length / 416;
			var peakLife = (life * ((tempo * 4) / 60)) / 16.0;
			var liveNotes = $('.sequences li span[data-life!="0"]').sort(sortNotes);
			liveNotes = $.grep(liveNotes, function(element, index) {
				return $(element).parent().parent().hasClass('locked');
			}, true);

			function sortNotes(a, b) {
				return ($(b).attr('data-life')) < ($(a).attr('data-life')) ? 1 : -1;
			}

			if (percentFilled > 0.2 && stutterState == 0) {
				for (var i=0; i < 8 && i < liveNotes.length; i++) {
					offObject($(liveNotes[i]).parent().parent().index()+1, $(liveNotes[i]).parent().index()+1);
				}
			}
			beat();
			if (stutter() > 0) {
				if (scounter < 1) {
					time++;
					scounter++;
				} else {
					if (time < 2) {
						time = 16;
					} else {
						time--;
					}
					scounter = 0;
				}
			} else {
				time++;
			}
			if (time>16) { time = 1; }
		}, (1000.0/(tempo/60.0))/(4.0*ssplit));
		state = 'playing';
	}
}

// Secondary playback functions

function pause() {
	if (state == 'playing') {
		clearInterval(mainLoop);
		for (var i=1; i<27; i++) {
			$('.sequences ul:nth-child(' + i + ') li:nth-child(' + time + ') span').addClass('paused');
		}
		$('.off').removeClass('off');
		$('.pause').addClass('off');
		$('.pauseplay').tooltipster('content', 'Play');
		state = 'paused';
	}
}

function stop() {
	time = 1;
	gater(0);
	stutter(0);
	clearInterval(mainLoop);
	$('.paused').removeClass('paused');
	$('.off').removeClass('off');
	$('.pause').addClass('off');
	$('.pauseplay').tooltipster('content', 'Play');
	state = 'stopped';
}

function restart() {
	$('.paused').removeClass('paused');
	$('.off').removeClass('off');
	$('.pause').addClass('off');
	$('.pauseplay').tooltipster('content', 'Play');
	time = 1;
	gcounter = 0;
	stutter(0);
	play();
}

function changeTempo(change) {
	var oldTempo = tempo;
	if (tempo + change > 0 && tempo + change < 1000) {
		if (state == 'playing') {
			play(tempo + change);
		} else {
			tempo = tempo + change;
		}
		$.each($('.sequences li span[data-life!="0"]'), function(index, value) {
			var objectLife = $(this).attr('data-life');
			var oldPeakLife = (life * ((oldTempo * 4) / 60)) / 16.0;
			var newPeakLife = (life * ((tempo * 4) / 60)) / 16.0;
			objectLife = objectLife * (newPeakLife / oldPeakLife);
			$(this).attr('data-life', objectLife);
		});
	}
	if (tempo < 100) {
		$('.tempo .text').html('&nbsp;&nbsp;' + tempo);
	} else if (tempo < 10) {
		$('.tempo .text').html('&nbsp;&nbsp;&nbsp;&nbsp;' + tempo);
	} else {
		$('.tempo .text').html(tempo);
	}
}

function changeFxPass(change) {
	if (fxpass + change < 11 && fxpass + change > -11) {
		fxpass = fxpass + change;
	}

	var width = $('filters').outerWidth();
	var barWidth = $('.slider .bar').width();
	var left = barWidth/2.0;
	var right = barWidth/2.0;
	if (fxpass > 0) {
		right = barWidth/2.0 + (fxpass / 20)*barWidth;
		rowFilter('lowpass',right*24)
	} else if (fxpass < 0) {
		left = barWidth/2.0 - (Math.abs(fxpass) / 20)*barWidth;
		rowFilter('highpass',left*24)

	} else {
		left = barWidth*.4875;
		right = barWidth*.5125;
	}

	$('.slider .bar').css({
		'clip': 'rect(0px,' + right + 'px,' + $(this).height() + 'px,' + left + 'px)'
	});
}

function clearFxPass() {
	fxpass = 0;
	changeFxPass(0);
}

function lockColumn(index) {
	$('.sequences ul:nth-child(' + (index+1) + ')').toggleClass('locked');
	lock[index] ^= 1;
}

function clearLock() {
	$('.sequences ul').removeClass('locked');
	$.each(lock, function(index, value) {
		lock[index] = 0;
	});
}

var socket = io.connect(document.location.host,{transports: [ 'websocket' ]});
var room = ""
var urlRoom = ""
socket.on('keys', function (data) {
	room = JSON.stringify(data.room)
	room = room.replace(/\"/g, "")
	urlRoom = document.location.pathname.split('/')[1];

	if(room.trim() == urlRoom) {
		playKeys(data.keys);}
	else if(room == "MMODM" && urlRoom == ''){
 		playKeys(data.keys);}
});

// Helper function
/*setInterval(function() {
	$('.tweet').attr('placeholder',
		'state: ' + state + ', ' +
		'tempo: ' + tempo + ', ' +
		'gater: ' + gater() + ', ' +
		'stutter: ' + stutter() + ', ' +
		'fxpass: ' + fxpass + ', ' +
		'time: ' + time
	);
}, 15);*/
