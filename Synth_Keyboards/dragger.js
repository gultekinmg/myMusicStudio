function _dragElement(elmnt,dragger) {	var pos1=pos2=pos3=pos4=0; 
	if (dragger) {dragger.onmousedown = dragMouseDown; /* if present, the dragger is where you move the DIV from:*/
	} else { elmnt.onmousedown = dragMouseDown; }/* otherwise, move the DIV from anywhere inside the DIV:*/
	function dragMouseDown(e) {e = e || window.event; e.preventDefault(); 
		pos3 = e.clientX;	pos4 = e.clientY; // get the mouse cursor position at startup:
		document.onmouseup = close_dragElement;   
		document.onmousemove = elementDrag; // call a function whenever the cursor moves:
	}
	function elementDrag(e) {e = e || window.event; e.preventDefault(); 
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX; 
		pos2 = pos4 - e.clientY; 
		pos3 = e.clientX; 
		pos4 = e.clientY; 
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; 
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"; 
	}
	function close_dragElement() {document.onmouseup = document.onmousemove = null; }/* stop moving when mouse button is released:*/
}