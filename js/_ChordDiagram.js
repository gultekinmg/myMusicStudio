/** * @overview This module is used to create chord diagram using SVG 
 * @module chordDiagram.js
 * @example
 * 4 required parameters:
 *     dots = [six,five,four,three,two,one]; array of fret location on the strings from 6-1
 *            NOTE: null will X that string and a negative value will ignore marking that string.
 *     root = [string,fret]; string/fret location of root, possible different than any of the dots, i.e. rootless voicing
 *     numberOFFrets = number of frets to draw in the diagram
 *     id = the id of the span tag to place the diagram
 * optional parameter
 *     offsetFret = [theFret, theNumber]  optional fret number marker (on the side of the diagram) 
 */
function ChordDiagram( parentId, chord, dots, root, numberOfFrets, offsetFret, fingers) {if(!chord)return; 
		//console.log("ChordDiagram() six="+dots[0]+" five="+dots[1]+" four="+dots[2]+" three="+dots[3]+" two="+dots[4]+" one="+dots[5]);
	let fretNumberInfo = (offsetFret === undefined) ? [null,null] : offsetFret; 
	let scaleFactor = 20;
	let height = numberOfFrets * scaleFactor, width = 6 * scaleFactor;
	let xOffset = Math.floor(width/5), yOffset = Math.floor(width/7);
	let fretWidth = Math.floor(width/6), stringSpacing = Math.floor(width/8.5);
	let dotOffset = Math.floor(width/15), dotSizeNote = Math.floor(width/20), dotSizeRoot = Math.floor(width/13);
	let length = fretWidth*(numberOfFrets-1);
	let omitStringLoc = Math.floor(width/8), openStringLoc = Math.floor(width/13), yLoc;
	let openDotColor = "white", rootDotColor = "yellow", fretDotColor = "red";
	let sideOffsetY = -Math.floor(width/30), sideOffsetX = Math.floor(width/20);	
	var dotColor, ignoreThisString = showPitchNames = false;
	///
	var htmlCode = "<svg height=" + (height+(yOffset*2)) + " width=" + width + ">\n";
	//chord id
		if(chord.length==1) chord+="maj";
    htmlCode += "<g><text x='"+ width/4+"' y='"+ 18+"' fill='black' style='font-size:18px'>"+ chord
						 +'</text></g><g transform="translate(0,22)">';	
    for(let i=0; i<6; i++) {// draw verical line (strings)
        var spacing = stringSpacing * i;
        htmlCode +=  "<line x1=" + (xOffset+spacing) +" y1=" + yOffset 
									+ " x2=" + (xOffset+spacing) + " y2=" + (length+yOffset) 
									+ " style=\"stroke:rgb(0,0,0);stroke-width:2\" />\n";
    }
    for(let i=0; i<numberOfFrets; i++) {// draw horizontal lines (frets)
        var fretSpace = fretWidth * i;
				var w=1;
				if(i==0)w=3;
        htmlCode += "<line x1=" + xOffset + " y1=" + (fretSpace+yOffset) 
				+ " x2=" + (xOffset+(stringSpacing*5)) + " y2=" + (fretSpace+yOffset) 
				+ ' style=\"stroke:rgb(0,0,0);stroke-width:'+w+'\" />\n';
    }
   // draw the root circle
    var yRootLoc = String((fretWidth * root[1])-dotOffset+yOffset);
		htmlCode += "<circle cx='"+ String(xOffset + (stringSpacing * (6-root[0]) )) +"' cy='"+ yRootLoc 
		+"' r='"+dotSizeRoot+"' stroke='black' stroke-width='1' fill='"+rootDotColor+"' />";
   // draw the dot circles
    ignoreThisString = false;
		for(let i=0;i<6;i++) { // string i
			if(dots[i] !== null) {
				if(dots[i] < 0) { ignoreThisString = true; } 
				else if(dots[i] === 0) { yLoc = openStringLoc; dotColor = openDotColor; }
				else {yLoc = String((fretWidth * dots[i])-dotOffset+yOffset); dotColor = fretDotColor;}
				if(!ignoreThisString) {
					htmlCode += "<circle cx='"+ String(xOffset + (stringSpacing * i)) +"' cy='"+ yLoc 
					+"' r='"+dotSizeNote+"' stroke='black' stroke-width='1' fill='"+dotColor+"' />";
					// draw fingers
					if(fingers) {
						htmlCode += "<text x='"+ String(xOffset + (stringSpacing * i)-4)
						+"' y='"+ String((fretWidth * dots[i])-dotOffset+yOffset+3)
						+"' fill='yellow' style='font-size'>"+fingers[i]+"</text>";
					}						
				}
			}
			else {// draw an X on this string
				htmlCode += "<text x='"+ String(xOffset/2 + (stringSpacing * i)+8) 
				+"' y='"+ omitStringLoc 
				+"' fill='black'>X</text>";
			}				
			ignoreThisString = false;
		}
	// draw the optional fret number
    if(fretNumberInfo[0] !== null) {
		var theFret = fretNumberInfo[0];
		var theNumber = fretNumberInfo[1];
		var yay=String(theFret*fretWidth + yOffset+sideOffsetY);//console.log("perde",theFret,fretWidth,yOffset,sideOffsetY,yay);
		if(theNumber > 9) { sideOffsetX = 0;}
        htmlCode += "<text x='"+ sideOffsetX +"' y='"+yay+"' fill='black'>"+ theNumber +"</text>";
        sideOffsetX = Math.floor(width/20);
    }	
	//
    htmlCode += "</g>Sorry, your browser does not support inline SVG.\n</svg>";
    document.getElementById(parentId).innerHTML = htmlCode;
	//    return htmlCode;
}

///
function myArray(name,value,root) {
    var arr= value;
		///
		var fltarr=arr.filter(function(val){return val !== null});
		var top=Math.min(...fltarr);//console.log(arr.id,fltarr,top);
		if(top==0)arr.min= [null,top]; else arr.min= [top,top];
		///
		if(top>=5){
			arr = fltarr.map(function(item, index) {return item - (top-1);});
			arr.min= [1,top];			
			if(root) root[1]= root[1]-(top-1);
		}
    arr.id= name;
    if(root) arr.root= root;
    arr.max= Math.max(...arr)+2; 
		console.log(arr.id,arr);
    return arr;
}

function drawChord(){  
	var chordid = document.getElementById("chord_input").value;
	var fu= getChordArr(chordid);
	if(!fu)return;	//console.log('fu',fu)	///return fu[0];
	var newchord= myArray(chordid,fu[0]);var fngrs=[];
	if(fu[1])fngrs=fu[1][0];
	if(newchord.root) var root=newchord.root;
	else var root=[99,99]; 
	/* {var ndx=newchord.findIndex(function(number) {return number > null;}); root=[6-ndx,newchord[ndx]];} */
	//console.log('newchord',newchord,/* ndx,newchord[ndx], */root,fngrs);
	ChordDiagram("chord_output", newchord.id, newchord, root, newchord.max, newchord.min, fngrs);
  ///var Amaj= myArray('Amaj',[null,0,2,2,2,0]   ,[5,0]);	///ChordDiagram("chord_output", Amaj.id, Amaj, Amaj.root, Amaj.max, Amaj.min);
}

function getChordArr(chordName) {
var chordVariations = [];
if (CHORD_COLLECTION[chordName])chordVariations = CHORD_COLLECTION[chordName]; else return;
	console.log('CCOL',chordVariations, 'P',chordVariations[0].positions, 'F',chordVariations[0].fingerings);
return [chordVariations[0].positions, chordVariations[0].fingerings];
}

