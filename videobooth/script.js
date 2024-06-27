var videos = {
	video1: "../video/demovideo1",
	video2: "../video/demovideo2"
}



window.onload = function() {

    effectFunction = null ; // set effectFunction default.

    var effectLinks = document.querySelectorAll("a.effect"); // take all <a> named effect.
    for (var i = 0; i < effectLinks.length; i++) { // looping over effects.
        effectLinks[i].onclick = setEffect; // making all of the <a> elements
    }                                       // on click when setEffect.

    var controlLinks = document.querySelectorAll("a.control"); // take all <a> control.
    for (var i = 0; i < controlLinks.length; i++) { // looping over controls.
        controlLinks[i].onclick = handleControl; // making all of the <a> elements
    }                                           // on click when setEffect.

    var videoLinks = document.querySelectorAll("a.videoSelection"); // take <a's>.
    for (var i = 0; i < videoLinks.length; i++) { // looping over videoLinks.
        videoLinks[i].onclick = setVideo;  // making all of the <a> elements
    }                                     // on click when setVideo.

    var video = document.getElementById("video");
    video.src = videos.video1 + getFormatExtension(); // video1 with extension
    video.load(); // loading video

    // after loading show these pressed on default.
    pushUnpushButtons("video1", []);
    pushUnpushButtons("normal", []);
    pushUnpushButtons("pause", []);
    
    // if video plays it will call function processFrame
	video.addEventListener("play", processFrame, false);

    video.addEventListener("ended", endedHandler, false)

    video.addEventListener("error", errorHandler, false);
}



function setEffect(e) {
    var id = e.target.getAttribute("id");

    if (id == "normal") {
        pushUnpushButtons("normal", ["western", "noir", "scifi"]);
        effectFunction = null ;
    } else if (id == "western") {
        pushUnpushButtons("western", ["normal", "noir", "scifi"]);
        effectFunction = western;
    } else if (id == "noir") {
        pushUnpushButtons("noir", ["normal", "western", "scifi"]);
        effectFunction = noir;
    } else if (id == "scifi") {
        pushUnpushButtons("scifi", ["normal", "western", "noir"]);
        effectFunction = scifi;
    }
}

function processFrame() {
	var video = document.getElementById("video");

	var bufferCanvas = document.getElementById("buffer");
	var displayCanvas = document.getElementById("display");
	var buffer = bufferCanvas.getContext("2d");
	var display = displayCanvas.getContext("2d");

	buffer.drawImage(video, 0, 0, bufferCanvas.width, bufferCanvas.height);
	var frame = buffer.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
	var length = frame.data.length / 4;

	for (var i = 0; i < length; i++) {
		var r = frame.data[i * 4 + 0];
		var g = frame.data[i * 4 + 1];
		var b = frame.data[i * 4 + 2];
		if (effectFunction) {
			effectFunction(i, r, g, b, frame.data);
		}
	}
	display.putImageData(frame, 0, 0);


    requestAnimationFrame(processFrame, 0);

}

function noir(pos, r, g, b, data) {
	var brightness = (3*r + 4*g + b) >>> 3;
	if (brightness < 0) brightness = 0;
	data[pos * 4 + 0] = brightness;
	data[pos * 4 + 1] = brightness;
	data[pos * 4 + 2] = brightness;
}

function western(pos, r, g, b, data) {
	var brightness = (3*r + 4*g + b) >>> 3;
	data[pos * 4 + 0] = brightness+40;
	data[pos * 4 + 1] = brightness+20;
	data[pos * 4 + 2] = brightness-20;
	data[pos * 4 + 3] = 255; //220;
}

function scifi(pos, r, g, b, data) {
	var offset = pos * 4;
	data[offset] = Math.round(255 - r) ;
	data[offset+1] = Math.round(255 - g) ;
	data[offset+2] = Math.round(255 - b) ;
}

function handleControl(e) {
    var id = e.target.getAttribute("id");
    var video = document.getElementById("video"); // reference to video obj
    // depending on which btn it was, interface reflect btn that was pushed
    // so if pause was pushed, play shouldn't
    // helper funct is for making sure the onscreen btn states are taken care of
    //it is called pushUnpushButtons
    //it takes a pushed btn along with array of unpushed and updates interface to reflect state
    if (id == "play") {
        pushUnpushButtons("play", ["pause"]);
        if (video.ended) { // if video ended 
            video.load(); // load video again
        }
        video.play();
    } else if (id == "pause") {
        pushUnpushButtons("pause", ["play"]);
        video.pause();
    } else if (id == "loop") {
        if (isButtonPushed("loop")) {
            pushUnpushButtons("", ["loop"]);
        } else {
            pushUnpushButtons("loop", []);
        }
        video.loop = !video.loop;
    } else if (id == "mute") {
        if (isButtonPushed("mute")) {
            pushUnpushButtons("", ["mute"]);
        } else {
            pushUnpushButtons ("mute", []);
        }
        video.muted = !video.muted;
    } // its all ab diff semantics, play/pause like radio buttons
      // while mute/loop like toggle buttons
}

function setVideo(e) {
    var id = e.target.getAttribute("id");
    var video = document.getElementById("video");
    if (id == "video1") {
        pushUnpushButtons("video1", ["video2"]);
    } else if (id == "video2") {
        pushUnpushButtons("video2", ["video1"]);
    }
    video.src = videos[id] + getFormatExtension();
    video.load();
    video.play();

    pushUnpushButtons("play", ["pause"]);
}

function getFormatExtension() {
	var video = document.getElementById("video");
	if (video.canPlayType("video/mp4") != "") {
		return ".mp4";
	} 
	else if (video.canPlayType("video/ogg") != "") {
		return ".ogv";
	}
	else if (video.canPlayType("video/webm") != "") {
		return ".webm";
	} 
}

//takes care of state of buttons
function pushUnpushButtons(idToPush, idArrayToUnpush) { //arguments are ids of btn to push in and unpush in array
	if (idToPush != "") { //1st check if id of the btn to push is not empty
		var anchor = document.getElementById(idToPush); //grab a elm. using that id 
		var theClass = anchor.getAttribute("class"); //get the class attribute
		if (!theClass.indexOf("selected") >= 0) {
			theClass = theClass + " selected"; // pressing btn by adding selected class to a elm.
			anchor.setAttribute("class", theClass);
			var newImage = "url(../images/" + idToPush + "pressed.png)"; //switch unpressed img with pressed image inside a elm.
			anchor.style.backgroundImage = newImage;
		}
	}
    //to unpush btns, loop through array of ids to unpush each a elm.
	for (var i = 0; i < idArrayToUnpush.length; i++) {
		anchor = document.getElementById(idArrayToUnpush[i]);
		theClass = anchor.getAttribute("class");
		if (theClass.indexOf("selected") >= 0) { // make sure the btn is pushed if so class will be "selected"
			theClass = theClass.replace("selected", "");
			anchor.setAttribute("class", theClass); //remove selected from the class 
			anchor.style.backgroundImage = ""; //remove bg img so can see unpushed btn
		}
	}
}

//checks if btn is pushed, takes id of a elm.
function isButtonPushed(id) { 
	var anchor = document.getElementById(id); //grabs a elm.
	var theClass = anchor.getAttribute("class"); //gets class of a elm.
	return (theClass.indexOf("selected") >= 0); //returns true if a elm. has been " selected"
}

function endedHandler() {
    pushUnpushButtons("pause", ["play"]);
}

function errorHandler() {
    var video = document.getElementById("video");
    if (video.error) {
        video.poster = "../images/technicaldifficulties.jpg";
        alert("error " + video.error.code + " have occured");
    }
}