
/**
 * @author Panda | http://payodpanda.com/
 */

var scrobbler,
    scrobblerWidth = 50,
    scrobblerX = 0,
    scrobblerY = 0,
    timeline,
    timelineWidth,
    timelineX,
    timelineY,
    timelineChange = true;

window.onload = function(){
    scrobbler = document.getElementById('scrobbler');
    scrobbler.style.width = scrobblerWidth + "px";
    scrobblerX = -scrobblerWidth / 2;
    scrobbler.style.left = scrobblerX + "px";
    timeline = document.getElementById('container-timeline');
    timelineX = timeline.getBoundingClientRect().left;
    timelineY = timeline.getBoundingClientRect().top;

    var onMouseMove = function (event) {
        if (mouseDown) {
            timelineChange = true;
            var mouseX = event.clientX || event.mozclientX || event.webkitclientX || 0;
            var mouseY = event.clientY || event.mozclientY || event.webkitclientY || 0;
            scrobblerX = (mouseX - scrobblerWidth / 2);
            scrobbler.style.left = scrobblerX + "px";
        }
    }

    // update this when mouse is clicked down and released, to enable move on mouse drag
    var mouseDown = false;

    function activateDrag() {
        mouseDown = true;
    }
    function deactivateDrag() {
        mouseDown = false;
        timelineChange = false;
    }

    timeline.addEventListener('mousemove', onMouseMove, false);
    timeline.addEventListener('mousedown', activateDrag, false);
    timeline.addEventListener('mouseup', deactivateDrag, false);
}