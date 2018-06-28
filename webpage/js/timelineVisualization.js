
// Set the scene size.
var widthTimeline = document.getElementById('container-timeline').clientWidth;
var heightTimeline = document.getElementById('container-timeline').clientHeight;

// Attach to the #container-timeline element
var containerTimeline = document.querySelector('#container-timeline');

// Create a WebGL renderer, camera and a scene
var sceneTimeline = new THREE.Scene();
var rendererTimeline = new THREE.WebGLRenderer();
rendererTimeline.setClearColor (0x151515, 1);
// Start the renderer.
rendererTimeline.setSize(widthTimeline, heightTimeline);

// Attach the renderer-supplied DOM element.
containerTimeline.appendChild(rendererTimeline.domElement);

var cameraTimeline =
    new THREE.OrthographicCamera(        
        0, widthTimeline,
        heightTimeline, 0,
        0, 30
    );
sceneTimeline.add(cameraTimeline);

function updateTimeline(sample, properties) {
    var sampleTimeline = samplesTimeline[properties.index];    
    var dimension4;
    var dimension4Min,
        dimension4Max;
    
    // default values:
    dimension4 = properties.PC1;
    dimension4Min = dataVar.pc_properties.PC1.min;
    dimension4Max = dataVar.pc_properties.PC1.max;

    switch (document.getElementById('dimension4-select').value) {
        case "PC1":
            dimension4 = properties.PC1;
            dimension4Min = dataVar.pc_properties.PC1.min;
            dimension4Max = dataVar.pc_properties.PC1.max;
            break;
        case "PC2":
            dimension4 = properties.PC2;
            dimension4Min = dataVar.pc_properties.PC2.min;
            dimension4Max = dataVar.pc_properties.PC2.max;
            break;
        case "PC3":
            dimension4 = properties.PC3;
            dimension4Min = dataVar.pc_properties.PC3.min;
            dimension4Max = dataVar.pc_properties.PC3.max;
            break;
        case "PC4":
            dimension4 = properties.PC4;
            dimension4Min = dataVar.pc_properties.PC4.min;
            dimension4Max = dataVar.pc_properties.PC4.max;
            break;
        default:
            dimension4 = properties.PC1;
            dimension4Min = dataVar.pc_properties.PC1.min;
            dimension4Max = dataVar.pc_properties.PC1.max;
            break;
    }
    // calculate the time-location on timeline
    var time = map(dimension4, dimension4Min, dimension4Max, 0, document.getElementById('container-timeline').clientWidth);

    // material based on properties
    if(testing) {
    } else {
        var hue = 0;
        var saturation = 1;
        var lightness = 0.5;

        // default color is white
        sampleTimeline.material.color.setHex(0xffffff);

        // get index to color materials
        var index = getMaterialsIndex(properties)[0];
        var noOfProperties = getMaterialsIndex(properties)[1];

        hue = index / (noOfProperties - 1);
        if (index === 0) lightness = 1;
        sampleTimeline.material.color.setHSL(hue, saturation, lightness);        
    }
    
    var width = 1;
    var height = heightTimeline / noOfProperties;
    var x = time;
    var y = (index+0.5) * height; // add 0.5 to offset the height

    sampleTimeline.scale.set(width, height, 1);
    sampleTimeline.position.x = x;
    sampleTimeline.position.y = y;
}


// Schedule the first frame (set-up the render loop)
//requestAnimationFrame(update);

function renderTimeline() { 
    rendererTimeline.render(sceneTimeline, cameraTimeline);
}

function updateScrobbler() {
    // if timeline is not being dragged, increment the timeline
    if (!timelineChange && animateTime) {
        scrobblerX += parseFloat(animateSpeed);
        if (!(scrobblerX >= document.getElementById('container-timeline').getBoundingClientRect().width)) {            
            scrobbler.position.x = scrobblerX;
        }
    }
}

function resizeTimeline(){

    cameraTimeline.aspect = document.getElementById('container-timeline').clientWidth / document.getElementById('container-timeline').clientHeight;
    cameraTimeline.updateProjectionMatrix();

    rendererTimeline.setSize( document.getElementById('container-timeline').clientWidth, document.getElementById('container-timeline').clientHeight );

}

var scrobbler,
    scrobblerWidth = 50,
    scrobblerX = 0,
    scrobblerY = 0,
    scrobblerZ = -1,
    timeline,
    timelineWidth,
    timelineX,
    timelineY,
    timelineChange = false;

window.onload = function () {
    // add the scrobbler
    scrobbler = new THREE.Mesh(
        new THREE.PlaneGeometry(1, heightTimeline),
        new THREE.MeshBasicMaterial({
            wireframe: false,
            color: 0x000000,
            transparent: true,
            opacity: 1
        })
    );
    scrobbler.scale.set(scrobblerWidth, 1, 1);
    scrobbler.position.y = heightTimeline / 2;
    scrobbler.position.z = scrobblerZ;
    sceneTimeline.add(scrobbler);

    timeline = document.getElementById('container-timeline');
    timelineX = timeline.getBoundingClientRect().left;
    timelineY = timeline.getBoundingClientRect().top;

    var onMouseMove = function (event) {
        if (mouseDown && !keyALT) {
            timelineChange = true;
            var mouseX = event.clientX || event.mozclientX || event.webkitclientX || 0;
            var mouseY = event.clientY || event.mozclientY || event.webkitclientY || 0;
            scrobblerX = (mouseX);
            scrobbler.position.x = scrobblerX;
        }
        if (mouseDown && keyALT) { 
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            scrobblerWidth += 2*movementX;
            scrobbler.scale.set(scrobblerWidth, 1, 1);
            scrobblerResize = true;
            updateEverything();
        }
    }

    // update this when mouse is clicked down and released, to enable move on mouse drag
    var mouseDown = false;
    var scrobblerResize = false;

    function activateDrag() {
        mouseDown = true;
    }
    function deactivateDrag() {
        if (scrobblerResize) { 
        }
        scrobblerResize = false;
        mouseDown = false;
        timelineChange = false;
    }

    timeline.addEventListener('mousemove', onMouseMove, false);
    timeline.addEventListener('mousedown', activateDrag, false);
    timeline.addEventListener('mouseup', deactivateDrag, false);
}