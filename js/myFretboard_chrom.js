/* forked from Fretboard (c) Michael Rieppel
// Internally, the program identifies notes by integers (see the global NOTES variable) rather than by their ordinary names,
// due to enharmonic equivalents which have two ordinary names. E.g. the program uniformly uses '1' for what would ordinarily be called either "C#" or "Db", depending on context.
// A scale is represented as an array of integers, each integer representing a note in the scale.
//  E.g. Cmaj is [0,2,4,5,7,9,11].
// Similarly for chords.  E.g. the Cmaj chord is represented as [0,4,7], corresponding to the 1st, 3rd, and 5th degrees of the Cmaj scale.
// The function scaleDict then takes a scale in array form and returns a dictionary that pairs integers in the array with ordinary note names,
// resolving between the two names of enharmonic equivalents as appropriate.
// Such a dictionary can also be applied to an array representing a chord to get the names of the notes in that chord.
*/
var NOTES = {"C":0,"B#":0,"C#":1,"Db":1,"D":2,"D#":3,"Eb":3,"E":4,"Fb":4,"E#":5,"F":5,"F#":6,"Gb":6,"G":7,"G#":8,"Ab":8,"A":9,"A#":10,"Bb":10,"B":11,"Cb":11};
var tuningArray=[];
var radio=11;
var circleAttributes = { r:radio, cx:d => d[0]==0 ? 35 : d[0]>=13 ? 600+((d[0]-11)*30)+5 : (d[0]*50)+30, cy:0 }; //console.log(circleAttributes);
//var circleStyleChords = {	"fill":"yellow", "fill-opacity":0.8, "stroke":"green", "stroke-width":1}//css
//var circleStyleScales = {	"fill":"aqua", "fill-opacity":0.8, "stroke":"green", "stroke-width":1, "font-family":"Verdana","font-size":"10px"}//css
var textAttrs = { x:d => d[0]==0 ? 28 : d[0]>=13 ? 600+((d[0]-11)*30)-4 : (d[0]*50)+20, y: 4};
//var textStyle = { /* "font-family":"Verdana", */ "font-size":"15px" };//css
var fredSize=17;
var dbg=4; /// 1:all 2: main 3:critical 4:none
var trigger;
//
function fredTuning(fret) { /// all tuning open strings and notes on scale
		var tuning = document.getElementById('chordtuning').value.split(",").reverse();
		tuning.forEach(function myFunction(item, index){tuningArray[index]=NOTES[item];});//	console.log('fredTuning',tuning,tuningArray); // tuningArray
		var board = makeBoard(tuning); //order
		/// prepaire string open notes
		if(fret=='chords')drawopennotes("chords",tuning);
		return board;
}
//
function setSelectedIndex(el, index){ /// trigger onchange for chromatic scale mode
   el.selectedIndex = index;
   el.dispatchEvent(new Event('change', { bubbles: true }));
}
function toggle_Scale() {    var checkBox = document.getElementById("myScale_CB");
	var x = document.getElementById("scale");	
	var root = document.getElementById('chordroot').value;
  if (checkBox.checked){
			x.style.display = "block";
			document.getElementById('II').style.display="";
			if(!root){setSelectedIndex(scalemode, 10);} /// if no root selected display chromatic scale
	}	else {
		x.style.display = "none";
		document.getElementById('II').style.display="none";
	} 
}
function toggle_Progress() { var checkBox = document.getElementById("myProgress_CB");	var x = document.getElementById("progress");
  if (checkBox.checked) {
			x.style.display = "block";
			document.getElementById('III').style.display="";
	}else {
		x.style.display = "none";
		document.getElementById('III').style.display="none";
	} 
}
//
function putScale() { // Main function to collect user input and display the appropriate scale 
	var root = document.getElementById('chordroot').value;
	var m = document.getElementById('scalemode'); 
	var mode = m.options[m.selectedIndex].text; // name of mode
	var modear = m.value.split(",").map(x => parseInt(x)); // interval array for mode
	var board = fredTuning('scales');
	if(root){
/* 		if(document.getElementById('chordmode').selectedIndex>=2 ) { /// only maj-min rooted scale fu..
			var scb=document.getElementById("myScale_CB");
			if (scb.checked)scb.click();
			return;
		} */
		var fscale = makeScale(modear,NOTES[root]); // Full scale
		var scale = getScaleFrag(fscale,mode); // Scale fragment for pentatonics etc.
		var boardnotes = findScaleNotes(board,scale);
		var dict = scaleDict(fscale,root);
		var scalestr = scale.map(x => dict[x]).join(","); // String description of scale	
		var boardnotes = putLetters(boardnotes,dict);
		d3.select("#scaleinfo").html(dict[NOTES[root]]+"/"+mode+"=>Scale: <strong>"+scalestr+'</strong>');
	}
	else {
		var dict = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
		var boardnotes = putLetters(board,dict);
		d3.select("#scaleinfo").html(mode+"Scale: <strong>"+dict+'</strong>');
	}
if(dbg<=1)console.log('putScale ...dict,board,fscale,scale,boardnotes=',dict,board,fscale,scale,boardnotes);
if(dbg<=2)console.log('putScale boardnotes',boardnotes,' scale root=',dict[NOTES[root]]+" "+mode+" Scale: "+scalestr);
	for(var i=0;i<boardnotes.length;i++) { draw_notes("scale",i+1,boardnotes[i],"noteScale"); }
if(dbg<=3)console.log('putScale-boardnotes=',boardnotes);
}
function getScaleFrag(fscale,mode) { // Takes a full scale (as an array of integers) and the name of a mode, and returns the appropriate scale fragment (for pentatonic scales, blues etc.).
	switch(mode) {
		case "Maj.Pentatonic" : return [fscale[0],fscale[1],fscale[2],fscale[4],fscale[5]];
		case "Min.Pentatonic" : return [fscale[0],fscale[2],fscale[3],fscale[4],fscale[6]];
		case "Blues" : return [fscale[0],fscale[2],fscale[3],fscale[4],fscale[5],fscale[7]];
		default : return fscale;//For full diatonic scales, just returns the original scale
	}
}
//
function putChord() { // Main function to collect user input and display the appropriate chord
	var root = document.getElementById('chordroot').value;
	var mc = document.getElementById('chordmode');
 	var mode = mc.options[mc.selectedIndex].text;	
	var ms = document.getElementById('scalemode');///coinsiding when chord mode change is ((maj/min/..) also coinside scale mode to refresh scale so on progress....
		if(mode=="maj"){if(ms.selectedIndex != "0")ms.selectedIndex = "0"; /* putScale(); */}
		if(mode=="min"){if(ms.selectedIndex != "1")ms.selectedIndex = "1"; /* putScale(); */}
	//
 	var modear = mc.value.split(",").map(x => parseInt(x));
	var scale = makeScale(modear,NOTES[root]);
	var chord = getChord(scale,mode);
	var board = fredTuning('chords');
	var boardnotes = findScaleNotes(board,chord);
	var dict = scaleDict(scale,root);
	var boardnotes = putLetters(boardnotes,dict);
	var chordstr = chord.map(x => dict[x]).join(",");
if(dbg<=1)console.log('putChord root=',root,'  mode=',mode,'modear[',modear,']   chord=',chord,'chordstr{',chordstr);
	d3.select("#chordinfo").html('<font color="red">'+dict[NOTES[root]]+mode+'</font>[<strong>'+chordstr+'</strong>]');//info
	for(var i=0;i<boardnotes.length;i++){ draw_notes("chords",i+1,boardnotes[i],"noteChord");
if(dbg<=1)console.log('putChord(boardnotes'+i+1+')=',boardnotes[i]);
		//draw_notes("scale",i+1,boardnotes[i],"Progress_Chords");
	}
	
}
function getChord(scale,mode) {// Takes a scale and the name of a "mode" (type of chord, e.g. "maj" or "dim7") and returns the fragment of the scale representing the chord.
	switch(mode) {
		case "maj" : return [scale[0],scale[2],scale[4]];
		case "min" : return [scale[0],scale[2],scale[4]];
		case "7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "maj7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "min7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "maj6" : return [scale[0],scale[2],scale[4],scale[5]];
		case "min6" : return [scale[0],scale[2],scale[4],scale[5]];
		case "aug" : return [scale[0],scale[2],scale[4]];
		case "dim" : return [scale[0],scale[2],scale[4]];
		case "dim7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "sus4" : return [scale[0],scale[3],scale[4]];
		case "9" : return [scale[0],scale[1],scale[2],scale[4],scale[6]];
		default : return scale;
	}
}
//
function scaleDict(scale,root) {// Takes a scale (array of integers) and a root (e.g. "C"), and returns the appropriate 
	root = root.replace(/b/g,'\u266D');//names for the other notes in the scale (determines whether e.g. C#, represented as an int 1 in the scale, should be called "C#" or "Db").  
	root = root.replace(/#/g,'\u266F');//Flats and sharps get returned in unicode.
	var test = root;
	var out = {};
	out[scale[0]] = root;
	for(var i=1;i<scale.length;i++) {out[scale[i]] = getLet(scale[i],test);test += ","+out[scale[i]];	}
	return out;
	function getLet(n,str) {
		switch(n) {
			case 0 : return str.indexOf("C")<0 ? "C" : "B\u266F";
			case 1 : return str.indexOf("C")<0 ? "C\u266F" : "D\u266D";
			case 2 : return "D";
			case 3 : return str.indexOf("D")<0 ? "D\u266F" : "E\u266D";
			case 4 : return "E";
			case 5 : return str.indexOf("F")<0 ? "F" : "E\u266F";
			case 6 : return str.indexOf("F")<0 ? "F\u266F" : "G\u266D";
			case 7 : return "G";
			case 8 : return str.indexOf("G")<0 ? "G\u266F" : "A\u266D";
			case 9 : return "A";
			case 10 : return str.indexOf("A")<0 ? "A\u266F" : "B\u266D";
			case 11 : return str.indexOf("B")<0 ? "B" : "C\u266D";		
		}
	}
}
function makeScale(_modear,root) {// Takes a _modear (an array specifying the intervals for the scale) and a root note 
// (represented as integer) and returns the scale (array of integers) starting at the  root and moving up by the specified intervals.
		var scale = [root];
if(dbg<=2)console.log('make-scale-root[',root,']  _modear',_modear);
		for(var i=0;i<(_modear.length-1);i++) {	root += _modear[i];	scale.push(root%12);
if(dbg<=2)console.log('root'+i,root);
		}
if(dbg<=3)console.log('made-scale:',i,scale);
	return scale;
}
function findScaleNotes(board,scale) {// Takes a full fretboard (each fret labeled with the note it corresponds to) and a scale
// (as an array of ints) and removes those frets from the fretboard that don't correspond to notes in the given scale
	return board.map(function (s) {return s.filter(function (p) {	return scale.indexOf(p[1]) >=0;});});
}
function makeBoard(tuning) {// Takes a tuning and returns a full fretboard based on that tuning, with each fret assigned the note it corresponds to on the given tuning.  
// A fretboard [][] is a  multidimensional array: one array for each of the 6 strings, where each of those arrays in turn consists of 17 arrays representing the 17 frets on that string.
//Each of these "fret arrays" contains two integers: [the fret number, note (as integer) ] that corresponds to that fret on the tuning.
	var board = [];
	var string = [];
	for(var i=0;i<6;i++) {
		var note = NOTES[tuning[i]];
		for(var j=0;j<=fredSize;j++) {	string.push([j,(note%12)]);	note++;}
		board.push(string);
		string = [];
	}
	return board;
}
function putLetters(board,dict) {// Takes a fretboard and a dictionary and labels assigns to each fret the ordinary note 
// that corresponds to it. (Frets are originally labeled with the integer name of the note, and this function replaces that integer with the ordinary name of the note.)
	return board.map(function(nested) {return nested.map(function(i) {	return [i[0],dict[i[1]]];});});
}
//
function putProg() {// Main function to collect user input and display the appropriate chord progression
	var root = document.getElementById('chordroot').value;
	var mc = document.getElementById('chordmode');
	var mode = mc.options[mc.selectedIndex].text; // name of mode from chords
	toggle_Progress();
	if(mode=="maj") 			{mode="Major";}
	else if(mode=="min") 	{mode="Minor";}
	else {
		document.getElementById("debuger").innerHTML="";
		document.getElementById('III').style.display="none";
		return;
	}
	var modear = mc.value.split(",").map(x => parseInt(x)); // interval array for mode
	var scale = makeScale(modear,NOTES[root]);
	var dict = scaleDict(scale,root);
	var scalenotes = scale.map(x => dict[x]); // Put letters for scale notes
	d3.select("#keyspan").html(dict[NOTES[root]]+mode);
	d3.select("#progdiv").html(makeProgressTable(scalenotes,mode));
	d3.select("#debuger").html("move mouse on progressive-chords to display them.");
}
function makeProgressTable(scale,mode) {// Takes a scale (array of ints) and the name of a mode (either "Major" or "Minor") and builds and html table for the chord progression based on that scale. 
	var pattern = (mode=="Major" ? ["","m","m","","","m","dim"] : ["m","dim","","m","m","",""]);
	var majnum = '<td><strong>I</strong></td><td>ii</td><td>iii</td><td><strong>IV</strong></td><td><strong>V</strong></td><td>vi</td><td>vii</td>';
	var minnum = '<td>i</td><td>ii</td><td><strong>III</strong></td><td>iv</td><td>v</td><td><strong>VI</strong></td><td><strong>VII</strong></td>';
	var pre = '';
			pre += '<table id="progtable"><tr><td></td>';
			pre += (mode=="Major" ? majnum : minnum);
			pre += '</tr><tr id="divider"><td class = "label">Chord:</td>';
			for(var i=0;i<7;i++){ ////
				if(mode=="Major" ){ if(i==0||i==3|i==4) {var styl='style="font-weight:800;" ';} else var styl='style="";'; }
				if(mode=="Minor" ){ if(i==2||i==5|i==6) {var styl='style="font-weight:800;" ';} else var styl='style="";'; }
				pre +='<td id="pattern'+(i+1)+'" '+styl+' onmouseover="Show_Progresses(\'pattern'+(i+1)+'\')">' +scale[i]+'/'+pattern[i]+ '</td>';
			}
			pre += '</tr><tr><td class = "label">Triad:</td>';
																		for(var i=0;i<7;i++){	pre +='<td>'+scale[i]+'</td>';}
			pre += '</tr><tr><td></td>';	for(var i=0;i<7;i++){	pre +='<td>'+scale[(i+2)%7]+'</td>';}
			pre += '</tr><tr><td></td>';	for(var i=0;i<7;i++){	pre +='<td>'+scale[(i+4)%7]+'</td>';}
			pre += '</tr></table>';
	return pre;
}
//
function clean_Progresses(){
		d3.selectAll(".Progress_Chords").remove();
		d3.select("#debuger").html("move mouse on progressive-chords to display them.");
		d3.select("#dig1").html("");
		d3.select("#dig2").html("");
		d3.select("#dig3").html("");
	}
function Show_Progress_Diagrams(chord) {///todo
var Cmaj= myArray('Cmaj',[null,3,2,0,1,0]   ,[5,3]);
var Cmin= myArray('Cmin',[null,null,5,5,4,3],[3,5]);
var viii_Cmaj= myArray('viii_Cmaj',[8,10,10,9,8,8]  ,[6,8]);
ChordDiagram("dig1", Cmaj.id, Cmaj, Cmaj.root, Cmaj.max, Cmaj.min);
ChordDiagram("dig2", Cmin.id, Cmin, Cmin.root, Cmin.max, Cmin.min);
ChordDiagram("dig3", viii_Cmaj.id, viii_Cmaj, viii_Cmaj.root, viii_Cmaj.max, viii_Cmaj.min);
	
}
function Show_Progresses(p) {/// onmouse function to collect user input and display the appropriate chord on scale
	Show_Progress_Diagrams(); /// another extra..
			var chordmode={
				"maj": ["2,2,1,2,2,2,1"],
				"min": ["2,1,2,2,1,2,2"],
				"aug": ["2,2,1,3,1,2,1"],
				"dim": ["2,1,2,1,2,2,2"],
				"sus4":["2,2,1,2,2,2,1"],
				"maj6":["2,2,1,2,2,2,1"],
				"min6":["2,1,2,2,2,1,2"],
				"7":	 ["2,2,1,2,2,1,2"],
				"maj7":["2,2,1,2,2,2,1"],
				"min7":["2,1,2,2,1,2,2"],
				"dim7":["2,1,2,1,2,1,3"],
				"9":	 ["2,2,1,2,2,1,2"]
			};
	var pop=document.getElementById("debuger");
	var p2 = document.getElementById(p).innerHTML;
	var root = p2.split("/");
  //names for the other notes in the scale (determines whether e.g. C#, represented as an int 1 in the scale, should be called "C#" or "Db").  
	var sroot= root[0].replace("♭", "b").replace("♯", "#"); //var sroot = root[0].replace(/b/g,'\u266D').replace(/#/g,'\u266F');//Flats and sharps get returned in unicode.
	var mode=root[1];// ? root[1]:"maj";
	if(mode==""){ var modear="2,2,1,2,2,2,1".split(",").map(x => parseInt(x));	mode="maj";} //major
	        else{ var modear="2,1,2,2,1,2,2".split(",").map(x => parseInt(x));	mode="min";}
if(dbg<=1)console.log('Show_Progresses',root,sroot,mode,modear,NOTES,NOTES[sroot],NOTES['Db']);
	var scale = makeScale(modear,NOTES[sroot]);
	var chord = getChord(scale,mode);
	var board = fredTuning('progress');
	var boardnotes = findScaleNotes(board,chord);
	var dict = scaleDict(scale,sroot);
	var boardnotes = putLetters(boardnotes,dict);
	var scalenotes = scale.map(x => dict[x]); // Put letters for scale notes    
	var chordstr = chord.map(x => dict[x]).join(",");
	var dingo = '<button onclick="clean_Progresses();"><font color="red">CLEAN DISPLAY</font></button>'+
			"<br/>dic:<strong>"+ dict[NOTES[sroot]]+mode+"</strong>"+
			"<br/>scale: <strong>"+scalenotes+'</strong>'+
			'<br/>modear= '+modear+
			'<br/>chord{'+chord+ "}:{ <strong>"+chordstr+"</strong> }";//'<br/>root[ '+sroot+'/'+mode+' ]'+
  pop.innerHTML=dingo;
if(dbg<=2)console.log(dingo);
if(document.getElementById(p).id=='pattern1') {d3.selectAll(".Progress_Chords").remove();return} /// if root chort dont show
	//
 	for(var i=0;i<boardnotes.length;i++){ draw_notes("progress",i+1,boardnotes[i],"Progress_Chords");}
if(dbg<=3)console.log('prg-c-boardnotes='+i+1,boardnotes[i]);
}

// BELOW ARE FUNCTIONS TO DRAW TO SVG USING D3 
function drawopennotes(parent,tuning) {//draws the notes each of the 6 strings is tuned to to the left of that string. // open notes text
	var y = d3.select("#"+parent).selectAll("g.string").data(tuning).selectAll("text.opennote").data(d => [d]);
			y.text(d => d);
			y.enter().append("text").attr("x",5).attr("y",5).attr("class","opennote").text(function(d){return d;});
			y.exit().remove();
}
function draw_notes(parent,string,frets,_cls) {// Draws the notes corresponding to the given scale or chord onto the fretboard.
	var st = d3.select("#"+parent).select("#s"+string);
	/*/////////////////////*/
	var c = st.selectAll("circle."+_cls).data(frets).attr(circleAttributes).attr("class",_cls);
												c.enter().append("circle").attr(circleAttributes).attr("class",_cls)
													.on("click", lightennote).on("mouseout", delightennote); //////ply note
	c.exit().remove();
	/*/////////over circle - ghosted ////////////*/
	var t = st.selectAll("text."+_cls).data(frets).attr(textAttrs).attr("class",_cls).text(d => d[1]);
	          t.data(frets).enter().append("text").attr(textAttrs).attr("class",_cls).text(d => d[1]);
	t.exit().remove();
if(dbg<=2)console.log('drawopennotes=',parent,string,frets,_cls,st.selectAll("circle."+_cls).data(frets));
}
//
function test_midi(){ //crates random inerval...
	var delay=[];for(var i=0;i<33;i++){delay.push(i);}
	delay.forEach(function(el,index){setTimeout(function(){test_play_midi();},index*Math.floor(Math.random()*50)*5);	});
}
function test_play_midi() {//// test random sound....
	var rnd_string=Math.floor(Math.random()*6)+1;
	var startno=tuningArray[rnd_string-1];//open note order %12 javascript
	//
	var getChord = document.getElementById('chordroot').value;
	var scb=document.getElementById('myScale_CB');
	if(getChord){
						var st = d3.select("#chords").select("#s"+rnd_string).selectAll("text.noteChord").data();
		if (scb.checked){   st = d3.select("#scale") .select("#s"+rnd_string).selectAll("text.noteScale").data(); }
		 // get random obj jn sel.scale
		var ndx=Math.floor(Math.random()*(st.length)); 
		var rnd_data=st[ndx];
		//
		draw_notes("midi",rnd_string, [rnd_data], "song"); ///draw again over note
		var fu = d3.select("#midi").select("circle");  ///single obj.
		var d3obj=fu[0][0]; 
		//
if(dbg<=4)console.log('Random_Chord_string:'+rnd_string,st,st.length,ndx,'tune:'+startno,'=>d3objects',d3obj,'rnd_data:',rnd_data);
	}
	else {
		var ndx=Math.floor(Math.random()*18); //random
		var keys= ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B','C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
		var letter=startno+ndx % 12 ; var key=keys[letter];//.toString()     startno+ndx % % keys.length for up fkit no time 4 this sht.
		//
		var rnd_note=[[ndx, key]]; var rnd_data=[rnd_note[0][0],rnd_note[0][1]]; //[3,'E']
		//
		draw_notes("midi",rnd_string, rnd_note, "song"); ///draw rnd note
		var fu = d3.select("#midi").select("circle");  ///single obj.
		var d3obj=fu[0][0]; 
		//
if(dbg<=4)console.log('Random_midi_string:'+rnd_string,'tune:'+startno,'=>d3obj',d3obj,'rnd_note:',rnd_note,'=>[ndx:'+ndx+',key:'+key+']');
	}
	playTHATsam(d3obj,rnd_data); /// playTHATsam( d3circle.obj, [srtringindex, note] );
	setTimeout(function(){ d3.selectAll(".song").remove();}, 600);
}
function midi_converter(note) {//// midi converter
	tuningArray[i];//open note order
	//Standard guitar tuning for a six string is; E3/68 - B2/63 - G2/59 - D2/54 - A1/49 - E1/44
	if(note>=38+i && note<=86+i)return;
}
//
function play_chords(x){////////////////
    for (var n=1; n<=6; n++){
		var st = d3.select("#chords").select("#s"+n).selectAll("text.noteChord").data();
		var rnd_data=st[x-1];
		//
		draw_notes("midi",n, [rnd_data], "song"); ///draw again over note
		var fu = d3.select("#midi").select("circle");  ///single obj.
		var d3obj=fu[0][0]; 
		//
		playTHATsam(d3obj,rnd_data); /// playTHATsam( d3circle.obj, [srtringindex, note] );
		setTimeout(function(){ d3.selectAll(".song").remove();}, 600);
	}
}
function playTHATsam(d3obj,z) { /* [d3circle.obj,[srtringindex,note]] */
		var sam=document.getElementById('samCB'), sin=document.getElementById('sinCB');
		if(!sam.checked && !sin.checked) return;
		
		/// ARRANGE OCTAVES FOR SEL.NOTE EACH STRING MAY INCLUDE AT MOST 3 OCTAVES ///////
		var PathString=d3obj.parentElement.id; /// get string.id // d[0] is index of selected note
			var x= PathString.slice(-1); //ith string 6th=e3
			var startno=tuningArray[x-1];//open note order
			var octave=2; //Estring starts  o2
			if(x==1) octave=4; //estring starts  o4
			if(x>=2 && x<=4) octave=3; //2345 are o3
			if(z[0]>=12-startno)octave+=1; //next scale due to order
			if(z[0]>=24-startno)octave+=2; //rest 3rd octave scale
			console.log('zzzzz:',z[0],z[1]);
		//
		///get INDEX of note. trash process to eliminate coding failures like => //var midinote=z[1]+'/'+octave; // E/8 etc. faulty for different notations like c#,db
		var midinote=NOTES[z[1].replace("♭","b").replace("♯","#")]+'/'+octave; ///////// 0/8 etc. necessary eliminate diez bemol...
		//
		if(sam.checked){ sin.checked=false; /// sam PLAYER.... TEST
			var trigger= new howlPlayer;
			trigger.play('0/3');
			trigger.fade(1, 0.1, 1000);
		}
		if(sin.checked){ sam.checked=false; /// synth PLAYER...
			var trigger= new howlPlayer;
			trigger.play(midinote);
			trigger.fade(1, 0.0, 800);//trigger.volume=1;Make a fade, from volume 0% to 60% in 10s
			//trigger.rate(0.8, sound_id1);
		}
if(dbg<=4)console.log('sam/ string:'+PathString,x,'tune:'+startno,'d3obj',d3obj,'play[midi:'+midinote,',oct:'+octave+'] z.data;',z);
}

/// create event handlers for mouse
function lightennote(d, i) {// Use D3 to select element, change color and size
		var tuning = document.getElementById('chordtuning').value.split(",").reverse();
		var that = d3.select(this), dx=that[0][0].cx.baseVal.value, dy=that[0][0].cy.baseVal.value;
		var flashBaseCss = that[0][0].classList[0];
		that[0][0].classList.add("flash"); //flashCss.attr("class","flash");
		//var fu = d3.select("frets");
		//console.log('dxdy',that,dx,dy);
		/* 
		that.append("text").attr({// Specify where to put label of text
			 id: "tuuu"+ i,  // Create an id for text so we can select it later for removing on mouseout
				x: (dx) - 30, y: (dy) - 30
		}).text(function(){ return 'fuuuuu';});// Value of the text			
		 */
		///reply_click(this)
		playTHATsam(that[0][0],d);
/* 			
		playTHATsam(that[0][0]);
		/// ARRANGE OCTAVES FOR SEL.NOTE EACH STRING MAY INCLUDE AT MOST 3 OCTAVES....
		var PathString=that[0][0].parentElement.id, octave; /// get string.id // d[0] is index of selected note
		var x= PathString.slice(-1); //ith string 6th=e3
		var startno=tuningArray[x-1];//open note order
			octave=2; //Estring starts  o2
			if(x==1) octave=4; //estring starts  o4
			if(x>=2 && x<=4) octave=3; //2345 are o3
			if(d[0]>=12-startno)octave+=1; //next scale due to order
			if(d[0]>=24-startno)octave+=2; //rest 3rd octave scale
		///
		var sam=document.getElementById('samCB'), sin=document.getElementById('sinCB');
		if(sam.checked){ sin.checked=false;
			var trigger= new howlPlayer;
			//var midinote=d[1]+'/'+octave; // E/8 etc. faulty
			var midinote=NOTES[d[1].replace("♭","b").replace("♯","#")]+'/'+octave; // 0/8etc. necessary eliminate diez bemol...
			trigger.play(midinote);
			trigger.fade(1, 0.0, 800);//trigger.volume=1;Make a fade, from volume 0% to 60% in 10s
		} */
if(dbg<=4)console.log('lightenNote class',flashBaseCss,'<svg> d3;',dx,dy,d,d[0],d[1],i+'ith d3elm');
}// Add song note,
function delightennote(d, i) { // Use D3 to select element, change color back to normal
			//d3.select("#t" + d.x + "-" + d.y + "-" + i).remove(); // Select text by id and then remove // Remove text location
			d3.select(this)[0][0].classList.remove("flash");
			//d3.select("#tuuu" + i).remove();  // Select text by id and then remove// Remove text location
		}
//
	function reply_click(e){//zil howled
    var audio = document.querySelectorAll('[data-audio-key="' + 80 + '"]')[0];
    audio.play();
/* 		var data = (e.getAttribute('data-key'));
			var audio = document.querySelectorAll('[data-audio-key="' + data + '"]')[0];
			e.classList.add("active");
			audio.play(); */
	}

/// /////////////// main ///////////////////// 
function myFredBoard() {
	var getChord = document.getElementById('chordroot').value;
	var II=document.getElementById('II');
	var III=document.getElementById('III');
	var scb=document.getElementById('myScale_CB');
	var pcb=document.getElementById('myProgress_CB');
	
	// place tuning..alwayz
	fredTuning('chords');

	if(getChord){ // when a chord selected		
		///document.getElementById('THEORY').style.display="";
		putChord();
		d3.select(".noteScale").remove();
		putScale();
		if (scb.checked){/*II.style.display=""; */} // display theory 
		d3.selectAll(".Progress_Chords").remove(); putProg();
		if (pcb.checked){III.style.display=""; }
	}
	else /* if(getChord=='') */{ //song mode.. only	
		// clean fred.......all......
		d3.selectAll(".noteChord").remove();		
		d3.selectAll(".noteScale").remove();
		d3.selectAll(".Progress_Chords").remove();
		//clean theory
	  d3.select("#chordinfo").html("display song/selected theory");
		d3.select("#progdiv").html("");
	  d3.select("#scaleinfo").html("select a root note");
		d3.select("#keyspan").html("select a root note");
		//uncheck all
		if (scb.checked)scb.click();
		if (pcb.checked)pcb.click();
		// hide else
		II.style.display="none";
		III.style.display="none";
	}
}
	
