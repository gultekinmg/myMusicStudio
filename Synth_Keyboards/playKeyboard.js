function playKeyboard(kbSound){
	var isMobile=!!navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
	let pressColor='#1BC0EA'; //color when key is pressed
	if(isMobile){var evtListener=['touchstart', 'touchend']; } else{var evtListener=['mousedown', 'mouseup']; }
	var __audioSynth=new AudioSynth();__audioSynth.setVolume(0.5);
	var __octave=4; //sets position of middle C, normally the 4th octave
	var song1=[ /// demo song
				['E,0', 8], ['D,0', 8], ['C,0', 2], ['C,0', 8], ['D,0', 8], ['C,0', 8], ['E,0', 8], ['D,0', 1], ['C,0', 8],
				['D,0', 8], ['E,0', 2], ['A,0', 8], ['G,0', 8], ['E,0', 8], ['C,0', 8], ['D,0', 1], ['A,0', 8], ['B,0', 8],
				['C,1', 2], ['B,0', 8], ['C,1', 8], ['D,1', 8], ['C,1', 8], ['A,0', 1], ['G,0', 8], ['A,0', 8], ['B,0', 2],
				['C,1', 8], ['B,0', 8], ['A,0', 8], ['G,0', 8], ['A,0', 1]
			];	
	var bindings={	// Key bindings, notes to keyCodes.
			192:  ['C,-2',  '~'  ],
			49:   ['C#,-2', '1'  ],
			50:   ['D,-2',  '2'  ],
			51:   ['D#,-2', '3'  ],
			52:   ['E,-2',  '4'  ],
			53:   ['F,-2',  '5'  ],
			54:   ['F#,-2', '6'  ],
			55:   ['G,-2',  '7'  ],
			56:   ['G#,-2', '8'  ],
			57:   ['A,-2',  '9'  ],
			48:   ['A#,-2', '0'  ],
			189:  ['B,-2',  '-'  ],
			187:  ['C,-1',  '='  ],
			81:   ['C#,-1', 'Q'  ],
			87:   ['D,-1',  'W'  ],
			69:   ['D#,-1', 'E'  ],
			82:   ['E,-1',  'R'  ],
			84:   ['F,-1',  'T'  ],
			89:   ['F#,-1', 'Y'  ],
			85:   ['G,-1',  'U'  ],
			73:   ['G#,-1', 'I'  ],
			79:   ['A,-1',  'O'  ],
			80:   ['A#,-1', 'P'  ],
			219:  ['B,-1',  '['  ],
			221:  ['C,0',   ']'  ],
			65:   ['C#,0',  'A'  ],
			83:   ['D,0',   'S'  ],
			68:   ['D#,0',  'D'  ],
			70:   ['E,0',   'F'  ],
			71:   ['F,0',   'G'  ],
			72:   ['F#,0',  'H'  ],
			74:   ['G,0',   'J'  ],
			75:   ['G#,0',  'K'  ],
			76:   ['A,0',   'L'  ],
			186:  ['A#,0',  ';'  ],
			222:  ['B,0',   '"'  ],
			90:   ['C,1',   'Z'  ],
			88:   ['C#,1',  'X'  ],
			67:   ['D,1',   'C'  ],
			86:   ['D#,1',  'V'  ],
			66:   ['E,1',   'B'  ],
			78:   ['F,1',   'N'  ],
			77:   ['F#,1',  'M'  ],
			188:  ['G,1',   ','  ],
			190:  ['G#,1',  '.'  ],
			191:  ['A,1',   '/'  ],
			 37:  ['A#,1',  '<-' ],
			 39:  ['B,1',   '->' ],
		};
	var reverseLookupText=reverseLookup={};
	for(var i in bindings) {	// Create a reverse lookup table.
		var val;
		switch(i|0){//some characters don't display like they are supposed to, so need correct values
			case 187: val=61; break;//equal sign	//???
			case 219: val=91; break;//open bracket	//left window key
			case 221: val=93; break;//close bracket	//select key
			case 188:	val=44; break;//comma	//print screen
			//the fraction 3/4 is displayed for some reason if 190 wasn't replaced by 46; it's still the period key either way
			case 190: val=46;	break;//period //delete
			default:	val=i;	break;
		}
		reverseLookupText[bindings[i][0]]=val;
		reverseLookup[bindings[i][0]]=i;
	}
	var keysPressed=[];	// Keys you have pressed down.
	let visualKeyboard=document.getElementById('keyboard');	// Generate keyboard
	let selectSound={ value: kbSound }; //piano or..
	var iKeys=0, iWhite=0, notes=__audioSynth._notes; //C, C#, ..., B
	for(var i=-2;i<=1;i++){/// generate keyboard../////octaves///////////c2/-1/0/c5/////sounds/are/filtered//by//available///key//codes/////////////////
		for(var n in notes) {
			if(n[2]!='b') {
				var thisKey=document.createElement('div');
				if(n.length>1){//adding sharp sign makes 2 characters
					thisKey.className='black key';if(kbSound=='0'){thisKey.className='keyboard_0_black key';}
					thisKey.style.left=(40 * (iWhite - 1)) + 25 + 'px'; //2 classes
				}
				else{
					thisKey.className='white key';if(kbSound=='0'){thisKey.className='keyboard_0_white key';}
					thisKey.style.left=40 * iWhite + 'px';	iWhite++;
				}
				var label=document.createElement('div'); label.className='labelDiv'; var oSign='';
				let s=getDispStr(n,i,reverseLookupText);			
				if(n=='C') oSign='<font style="color:red"><span value="' + i + '">' 
													+ (__octave + parseInt(i)) + '</span></font>';
				label.innerHTML='<b class="keyLabel">' + s + '</b>' + '<br /><br />' //name="'+visualKeyboard.id+'_oLABEL" 
													+ n.substr(0,1) + (n.substr(1,1)?n.substr(1,1):'') + oSign;
				thisKey.appendChild(label);
				thisKey.setAttribute('ID', visualKeyboard.id+'_KEY_' + n + ',' + i);
				thisKey.addEventListener(evtListener[0], (function(_temp) {
						return function(){fnONKEYTOUCH({keyCode:_temp}); } })(reverseLookup[n + ',' + i]));
				/* //
				if(i>=2 && n>='F')thisKey.setAttribute('CLASS', 'hide'); //reduce notes..
				if(i<=-3 && n>='C')thisKey.setAttribute('CLASS', 'hide'); //reduce notes..
				if(visualKeyboard.id=='keyboard_2'){if(i<=-3 || i==-2 && n>='C' && n<='D#')thisKey.setAttribute('CLASS', 'hide');}
				//  */
				visualKeyboard[n + ',' + i]=thisKey;
				visualKeyboard.appendChild(thisKey);
				iKeys++;
			}
		}
	}
	visualKeyboard.style.width=iWhite * 40 + 'px';
	///////////
	window.addEventListener(evtListener[1],
		function(){n=keysPressed.length; while(n--){ fnREMOVEKeyBinding({keyCode:keysPressed[n]});}}
	);
	///////////
	var fnONKEYTOUCH=function(e) {			// Detect keypresses, play notes.
		var i=keysPressed.length;
		while(i--){if(keysPressed[i]==e.keyCode) {return false;}}
		keysPressed.push(e.keyCode);
		if(!bindings[e.keyCode])return;
		switch(e.keyCode) {
			//case 37:fnChangeOctave(-1);break;// left
			//case 39:fnChangeOctave(1);break;// right
			case 16:return;break;// shiift pay yhis song break; 16
			case 32:fnPLAYSONG(song1);break;// space play this song once cus its a variable; 
		}
		var __keyNote=bindings[e.keyCode][0];
		if(__keyNote) {
			if(visualKeyboard[__keyNote]) {
				 visualKeyboard[__keyNote].style.backgroundColor=pressColor;
				 visualKeyboard[__keyNote].style.marginTop='4px';
				 visualKeyboard[__keyNote].style.boxShadow='none';
				 bu(bindings[e.keyCode][1]);
			}
			var arrPlayNote=__keyNote.split(',');
			var note=arrPlayNote[0];
			var octaveModifier=arrPlayNote[1]|0;
			fnPLAYNOTE(note, __octave + octaveModifier);
		} else {return false;	}
	}
	var fnREMOVEKeyBinding=function(e) {		// Remove key bindings once note is done.
		var i=keysPressed.length;
		if(!bindings[e.keyCode])return;
		var __keyNote=bindings[e.keyCode][0];
		while(i--) {
			if(keysPressed[i]==e.keyCode) {
				if(visualKeyboard[__keyNote]) {
					 visualKeyboard[__keyNote].style.backgroundColor='';
					 visualKeyboard[__keyNote].style.marginTop='';
					 visualKeyboard[__keyNote].style.boxShadow='';
				}
				keysPressed.splice(i, 1);
			}
		}
	}
	var fnPLAYNOTE=function(note, octave) {	// Generates audio for pressed note and returns that to be played
		src=__audioSynth.generate(document.getElementById('sound').value, note, octave, 2);
		container=new Audio(src);
		container.addEventListener('ended', function(){container=null; });
		container.addEventListener('loadeddata', function(e){e.target.play(); });
		container.autoplay=false;
		container.setAttribute('type', 'audio/wav');
		container.load();
		return container;
	};

	function getDispStr(n,i,lookup) {				//returns correct string for display
		if(n=='C' && i==-2){ return "~";}
		else if(n=='B' && i==-2){return "-";}
		else if(n=='A#' && i==0){return ";";}
		else if(n=='B' && i==0){return "\"";}
		else if(n=='A' && i==1){return "/";}
		else if(n=='A#' && i==1){return "<-";}
		else if(n=='B' && i==1){return "->";}
		else{ return String.fromCharCode(lookup[n + ',' + i]);}
	}

	window.addEventListener('keydown', fnONKEYTOUCH);// needed for song	&
	window.addEventListener('keyup', fnREMOVEKeyBinding);
			
	var fnPLAYSONG=function(arr) {var farr=arr;
		if(farr.length>0){var noteLen=1000*(1/parseInt(farr[0][1]));
			if(!(farr[0][0] instanceof Array))farr[0][0]=[farr[0][0]];
			var i=farr[0][0].length;
			var keys=[];	while(i--) {keys.unshift(reverseLookup[farr[0][0][i]]); fnONKEYTOUCH({keyCode:keys[0]});	}
			farr.shift();
			setTimeout(function(farray, val){ return function() {
				var i=val.length; while(i--){fnREMOVEKeyBinding({keyCode:val[i]}); }
				fnPLAYSONG(farray); }
				}(farr, keys),	noteLen);
		}
	};

	bu([bindings,reverseLookup,'reverseLookupText',reverseLookupText, reverseLookupText['C,0'] ]);//  test
}

function hide_letters() {	var x=document.getElementsByClassName("keyLabel");
	for (i=0;i<x.length;i++){ x[i].style.display = x[i].style.display === 'block' ? 'none' : 'block';}
	play_binds();
}
function play_binds() {for(i=37;i<=91;i++)play_chords(i);}
function play_chords(x,d) { if(!d)d=600;//x|=65; 
	var evt = new KeyboardEvent('keydown',{'keyCode':x,'which':x}); window.dispatchEvent (evt);
	var evt = new KeyboardEvent('keyup',{'keyCode':x,'which':x}); setTimeout(function(){window.dispatchEvent(evt);},d);
}
function bu(ne) {document.getElementById("demo").innerHTML=ne;	console.log(ne);}
