
// set a variable to enable testing or not
var testing = false;
var containerMain = document.querySelector('#container-main');

// Set the scene size.
var widthMain = containerMain.clientWidth;
var heightMain = containerMain.clientHeight;

// Set camera attributes.
var VIEW_ANGLE = 60;
var ASPECT = widthMain / heightMain;
var NEAR = 0.001;
var FAR = 10000;

// Create a WebGL renderer, camera and a scene
var sceneMain = new THREE.Scene();
var cameraMain =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );
cameraMain.position.z = 1000;
sceneMain.add(cameraMain);

// create controller from script
var controls = new THREE.Controls( cameraMain );
controls.enabled = true;
sceneMain.add(controls.getObject());

// renderer
var rendererMain = new THREE.WebGLRenderer();
rendererMain.setClearColor (0X000000, 1);
rendererMain.setSize(widthMain, heightMain);
containerMain.appendChild(rendererMain.domElement);

// lights
var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;
sceneMain.add(pointLight);

var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
sceneMain.add( light );

// add cartesian system
var cartesian = new THREE.Mesh(
    new THREE.PlaneGeometry(
        2*globeRadius, 2*globeRadius, 18, 18
    ),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x0d0d0d
    })
);
sceneMain.add(cartesian);

// add cylinder system
var cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(
        globeRadius, globeRadius, 2*globeRadius, 18, 18, true
    ),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x0d0d0d
    })
);
sceneMain.add(cylinder);

// add sphere system
var globeRadius = 200;
var globe = new THREE.Mesh(
    new THREE.SphereGeometry(
        globeRadius, 18, 18
    ),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x0d0d0d
    })
);
sceneMain.add(globe);

if(testing) var dataset = "./small.json"; else var dataset = "../data/AG-PCOA-6D.json";

// data gathering and object creation from data. This needs to happen every frame
// since I've made it dynamic now so needs to calculate each time a frame is rendered.
// so the spheres will be pushed to an array, and made disabled. 
// Each time it's required, we enable it in the update() function.
// define a new array that will store the spheres
var spheres = [];
var samplesTimeline = [];
var dataVar;
var dataLoaded = false;

d3.json(dataset, function(data) {
    dataVar = data;
    dataLoaded = true;
    //jQuery works the best for our purposes, but it's overkill. Need to find a way to replicate that functionality without including all of jQuery.
    $.each(dataVar.samples, function (sample, properties) {
        // define a basic material to serve as the base
        var sphereMaterial = new THREE.MeshLambertMaterial(
            {
                visible: false,
                transparent: true
            });

        // make the material invisible by default, enable later in updateSphere()

        var RADIUS = 2;
        var SEGMENTS = 9;
        var RINGS = 12;
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                RADIUS,
                SEGMENTS,
                RINGS),
            sphereMaterial);
        
        sphere.geometry.verticesNeedUpdate = true;
        sphere.geometry.normalsNeedUpdate = true;

        // add this sphere to the array and the scene
        spheres.push(sphere);
        sceneMain.add(sphere);

        // add the index property to dataVar properties
        properties.index = spheres.length - 1;

        // mesh
        var materialTimeline = new THREE.MeshBasicMaterial();
        materialTimeline.transparent = true;
        materialTimeline.opacity = 0.15;
        var planeGeometry = new THREE.PlaneGeometry( 1, 1 );
        var planeTimeline = new THREE.Mesh(planeGeometry, materialTimeline);
        samplesTimeline.push(planeTimeline);
        sceneTimeline.add(planeTimeline);

        updateSphere(sample, properties);
        updateTimeline(sample, properties);
    });
});

// define a mapping function
function map(val, min1, max1, min2, max2){
    return min2 + (max2 - min2) * (val - min1) / (max1 - min1);
}

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

// define camera delta values that you'll use
// to calculate new camera position in render loop
var camDeltaX = 0;
var camDeltaY = 0;
var camDeltaZ = 0;

var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;
var keyUP = false;
var keyDOWN = false;
var keyALT = false;
var keyCTRL = false;

function onKeyDown(event) {
    var keyCode = event.keyCode;
    switch (keyCode) {
        case 68: //d
        keyD = true;
        break;
        case 83: //s
        keyS = true;
        break;
        case 65: //a
        keyA = true;
        break;
        case 87: //w
        keyW = true;
        break;
        case 38: //up
        keyUP = true;
        break;
        case 40: //down
        keyDOWN = true;
        break;
        case 18: //alt
        keyALT = true;
        break;
        case 17: //ctrl
        keyCTRL = true;
        break;
    }
}

function onKeyUp(event) {
    var keyCode = event.keyCode;
    
    switch (keyCode) {
        case 68: //d
        keyD = false;
        break;
        case 83: //s
        keyS = false;
        break;
        case 65: //a
        keyA = false;
        break;
        case 87: //w
        keyW = false;
        break;
        case 38: //up
        keyUP = false;
        break;
        case 40: //down
        keyDOWN = false;
        break;
        case 18: //alt
        keyALT = false;
        break;
        case 17: //ctrl
        keyCTRL = false;
        break;
    }
}

function update() {
    
    if (dataLoaded) {
        // if timeline is not being dragged, increment the timeline
        updateScrobbler();

        // ONLY update if timeline is being changed.
        if (timelineChange || animateTime) {
            if (!(scrobblerX >= document.getElementById('container-timeline').getBoundingClientRect().width)) {
                $.each(dataVar.samples, function (sample, properties) {
                    updateSphere(sample, properties);
                });
            }
        }

        // update the camera getting values from Controls script
        // onKeyDown and onKeyUp functions
        if (keyS) {
            cameraMain.position.z += 25;
        }
        if (keyW) {
            cameraMain.position.z -= 25;
            if (cameraMain.position.z <= 0) cameraMain.position.z = 0;
        }/*
        if (keyD) {
            cameraMain.position.x += 1;
        }
        if (keyA) {
            cameraMain.position.x -= 1;
        }
        if (keyUP) {
            cameraMain.position.y += 1;
        }
        if (keyDOWN) {
            cameraMain.position.y -= 1;
        }*/
        cameraMain.updateProjectionMatrix();

        // draw
        rendererMain.render(sceneMain, cameraMain);
        renderTimeline();
    }

    // redraw
    requestAnimationFrame(update);
}

// Schedule the first frame (set-up the render loop)
requestAnimationFrame(update);


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    cameraMain.aspect = containerMain.clientWidth / containerMain.clientHeight;
    cameraMain.updateProjectionMatrix();

    rendererMain.setSize( containerMain.clientWidth, containerMain.clientHeight );

    resizeTimeline();
}

var CATEGORY = "SITE_SAMPLED";
var categorySelect = document.getElementById('category-select');
categorySelect.onchange = updateCategory;

function updateCategory(event) { 
    CATEGORY = event.target.value;
    updatePCOA();
    updateEverything();
}

updatePCOA();

function updatePCOA() {
    var category = document.getElementById('category-select');
    document.getElementById('category-checkboxes').innerHTML = '';
    for (i = 0; i < category.options.length; i++) {
        var value = category.options[i].value;
        //console.log('<input type="checkbox" value="'+ value +'">' + value + '</input>');
        $('#category-checkboxes').append('<input type="checkbox" value="'+ value +'" checked>' + value + '<br>');
    }
    $('#category-checkboxes').append('<input type="submit">');
}

document.getElementById('dimension1-select').onchange = updateEverything;
document.getElementById('dimension2-select').onchange = updateEverything;
document.getElementById('dimension3-select').onchange = updateEverything;
document.getElementById('dimension4-select').onchange = updateEverything;
document.getElementById('layout-select').onchange = updateEverything;
/*
document.getElementById('layout-2d').onclick = change2D;
document.getElementById('layout-3d').onclick = change3D;
document.getElementById('layout-cylindrical').onclick = changeCylindrical;
document.getElementById('layout-spherical').onclick = changeSpherical;
*/
function change2D(event) { 
    
}
function change3D(event) { 
    
}
function changeCylindrical(event) { 
    
}
function changeSpherical(event) { 
    
}

function updateEverything() { 
    $.each(dataVar.samples, function (sample, properties) {
        updateSphere(sample, properties);
        updateTimeline(sample, properties);
    });
}

function updateSphere(sample, properties) {
    var sphere = spheres[properties.index];
    var dimension1,
        dimension2,
        dimension3,
        dimension4;
    var dimension1Min,
        dimension1Max,
        dimension2Min,
        dimension2Max,
        dimension3Min,
        dimension3Max,
        dimension4Min,
        dimension4Max;
    var x, y, z;
    var scale = 500; 

    // deafault values:
    
    dimension1 = properties.PC1;
    dimension1Min = dataVar.pc_properties.PC1.min;
    dimension1Max = dataVar.pc_properties.PC1.max;

    dimension2 = properties.PC1;
    dimension2Min = dataVar.pc_properties.PC1.min;
    dimension2Max = dataVar.pc_properties.PC1.max;

    dimension3 = properties.PC1;
    dimension3Min = dataVar.pc_properties.PC1.min;
    dimension3Max = dataVar.pc_properties.PC1.max;

    dimension4 = properties.PC1;
    dimension4Min = dataVar.pc_properties.PC1.min;
    dimension4Max = dataVar.pc_properties.PC1.max;

    switch (document.getElementById('dimension1-select').value) {
        case "PC1":
            dimension1 = properties.PC1;
            dimension1Min = dataVar.pc_properties.PC1.min;
            dimension1Max = dataVar.pc_properties.PC1.max;
            break;
        case "PC2":
            dimension1 = properties.PC2;
            dimension1Min = dataVar.pc_properties.PC2.min;
            dimension1Max = dataVar.pc_properties.PC2.max;
            break;
        case "PC3":
            dimension1 = properties.PC3;
            dimension1Min = dataVar.pc_properties.PC3.min;
            dimension1Max = dataVar.pc_properties.PC3.max;
            break;
        case "PC4":
            dimension1 = properties.PC4;
            dimension1Min = dataVar.pc_properties.PC4.min;
            dimension1Max = dataVar.pc_properties.PC4.max;
            break;
        default:
            dimension1 = properties.PC1;
            dimension1Min = dataVar.pc_properties.PC1.min;
            dimension1Max = dataVar.pc_properties.PC1.max;
            break;
    }
    switch (document.getElementById('dimension2-select').value) {
        case "PC1":
            dimension2 = properties.PC1;
            dimension2Min = dataVar.pc_properties.PC1.min;
            dimension2Max = dataVar.pc_properties.PC1.max;
            break;
        case "PC2":
            dimension2 = properties.PC2;
            dimension2Min = dataVar.pc_properties.PC2.min;
            dimension2Max = dataVar.pc_properties.PC2.max;
            break;
        case "PC3":
            dimension2 = properties.PC3;
            dimension2Min = dataVar.pc_properties.PC3.min;
            dimension2Max = dataVar.pc_properties.PC3.max;
            break;
        case "PC4":
            dimension2 = properties.PC4;
            dimension2Min = dataVar.pc_properties.PC4.min;
            dimension2Max = dataVar.pc_properties.PC4.max;
            break;
        default:
            dimension2 = properties.PC1;
            dimension2Min = dataVar.pc_properties.PC1.min;
            dimension2Max = dataVar.pc_properties.PC1.max;
            break;
    }
    switch (document.getElementById('dimension3-select').value) {
        case "PC1":
            dimension3 = properties.PC1;
            dimension3Min = dataVar.pc_properties.PC1.min;
            dimension3Max = dataVar.pc_properties.PC1.max;
            break;
        case "PC2":
            dimension3 = properties.PC2;
            dimension3Min = dataVar.pc_properties.PC2.min;
            dimension3Max = dataVar.pc_properties.PC2.max;
            break;
        case "PC3":
            dimension3 = properties.PC3;
            dimension3Min = dataVar.pc_properties.PC3.min;
            dimension3Max = dataVar.pc_properties.PC3.max;
            break;
        case "PC4":
            dimension3 = properties.PC4;
            dimension3Min = dataVar.pc_properties.PC4.min;
            dimension3Max = dataVar.pc_properties.PC4.max;
            break;
        default:
            dimension3 = properties.PC1;
            dimension3Min = dataVar.pc_properties.PC1.min;
            dimension3Max = dataVar.pc_properties.PC1.max;
            break;
    }
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
    switch (document.getElementById('layout-select').value) {
        case "2D":
            x = map(dimension1, dimension1Min, dimension1Max, -globeRadius, globeRadius);
            y = map(dimension2, dimension2Min, dimension2Max, -globeRadius, globeRadius);
            z = 0;
            
            cartesian.material.visible = true;
            cylinder.material.visible = false;
            globe.material.visible = false;
            break;
        case "3D":
            x = map(dimension1, dimension1Min, dimension1Max, -globeRadius, globeRadius);
            y = map(dimension2, dimension2Min, dimension2Max, -globeRadius, globeRadius);
            z = map(dimension3, dimension3Min, dimension3Max, -globeRadius, globeRadius);
            
            cartesian.material.visible = true;
            cylinder.material.visible = false;
            globe.material.visible = false;
            break;
        case "Cylindrical":
            var h = map(dimension1, dimension1Min, dimension1Max, -globeRadius, globeRadius);    // -90 to +90
            var phi = map(dimension2, dimension2Min, dimension2Max, -Math.PI, Math.PI);   // 0 to 360
            var radius = globeRadius + scale*dimension3;

            x = radius*Math.cos(phi);
            y = h;
            z = radius*Math.sin(phi);

            cartesian.material.visible = false;
            cylinder.material.visible = true;
            globe.material.visible = false;
            break;
        case "Spherical":
            var theta = map(dimension1, dimension1Min, dimension1Max, -Math.PI/2, Math.PI/2);    // -90 to +90
            var phi = map(dimension2, dimension2Min, dimension2Max, -Math.PI, Math.PI);   // 0 to 360
            var radius = globeRadius + scale*dimension3;

            x = radius*Math.sin(theta)*Math.cos(phi);
            y = radius*Math.sin(theta)*Math.sin(phi);
            z = radius*Math.cos(theta);

            cartesian.material.visible = false;
            cylinder.material.visible = false;
            globe.material.visible = true;
            break;
        default:
            var theta = map(dimension1, dimension1Min, dimension1Max, -Math.PI/2, Math.PI/2);    // -90 to +90
            var phi = map(dimension2, dimension2Min, dimension2Max, -Math.PI, Math.PI);   // 0 to 360
            var radius = globeRadius + scale*dimension3;

            x = radius*Math.sin(theta)*Math.cos(phi);
            y = radius*Math.sin(theta)*Math.sin(phi);
            z = radius*Math.cos(theta);

            sphere.material.visible = true;
            cylinder.material.visible = false;
            break;
    }

    // opacity:
    // calculate the time-location on timeline; check if current location of scrobbler coincides with this time
    var time = map(dimension4, dimension4Min, dimension4Max, 0, document.getElementById('container-timeline').clientWidth);
    if ((time < scrobblerX + scrobblerWidth / 2) && (time > scrobblerX - scrobblerWidth / 2)) {
        // make the material visible
        var posX = samplesTimeline[properties.index].position.x;
        sphere.material.visible = true;
        sphere.material.transparent = true;
        sphere.material.opacity = 1.0 - Math.abs((scrobblerX - posX) * 2 / scrobblerWidth);
    } else {
        sphere.material.visible = false;
    }
    // color:
    // sphere material based on properties
    if (testing) {
        sphere.material.color = properties.color;
    } else {
        var hue = 0;
        var saturation = 1;
        var lightness = 0.5;

        // default color is white
        sphere.material.color.setHex(0xffffff);

        // get index to color materials
        var index = getMaterialsIndex(properties)[0];
        var noOfProperties = getMaterialsIndex(properties)[1];

        hue = index / (noOfProperties - 1);
        if (index === 0) lightness = 1;

        sphere.material.color.setHSL(hue, saturation, lightness);
    }
    // position:

    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
}

function getMaterialsIndex(properties) {
    switch (CATEGORY) {
        default:
            var noOfProperties = 1;
            index = 0;
            break;
        case "DOG":
            var noOfProperties = 3;
            index = 0;
            if(properties.DOG == "yes") {
                index = 1;
            }
            if(properties.DOG == "no") {
                index = 2;
            }
            break;
        case "DIET_TYPE":
            var noOfProperties = 6;
            index = 0;
            if(properties.DIET_TYPE == "Vegan") {
                index = 1;
            }
            if(properties.DIET_TYPE == "Omnivore") {
                index = 2;
            }
            if(properties.DIET_TYPE == "Vegetarian but eat seafood") {
                index = 3;
            }
            if(properties.DIET_TYPE == "Omnivore but no red meat") {
                index = 4;
            }
            if(properties.DIET_TYPE == "Vegetarian") {
                index = 5;
            }
            break;
        case "DIABETES":
            var noOfProperties = 4;
            index = 0;
            if(properties.DIABETES == "I do not have diabetes") {
                index = 1;
            }
            if(properties.DIABETES == "Type I") {
                index = 2;
            }
            if(properties.DIABETES == "Type II") {
                index = 3;
            }
            break;        
        case "SITE_SAMPLED":
            var noOfProperties = 13;
            index = 0;
            if (properties.SITE_SAMPLED == "Stool") {
                index = 1;
            }
            if (properties.SITE_SAMPLED == "Mouth") {
                index = 2;
            }
            if (properties.SITE_SAMPLED == "Left hand") {
                index = 3;
            }
            if (properties.SITE_SAMPLED == "Forehead") {
                index = 4;
            }
            if (properties.SITE_SAMPLED == "Nares") {
                index = 5;
            }
            if (properties.SITE_SAMPLED == "control") {
                index = 6;
            }
            if (properties.SITE_SAMPLED == "blank") {
                index = 7;
            }
            if (properties.SITE_SAMPLED == "Blank") {
                index = 8;
            }
            if (properties.SITE_SAMPLED == "Right hand") {
                index = 9;
            }
            if (properties.SITE_SAMPLED == "Vaginal mucus") {
                index = 10;
            }
            if (properties.SITE_SAMPLED == "Extraction blank") {
                index = 11;
            }
            if (properties.SITE_SAMPLED == "Hair") {
                index = 12;
            }
            break; 
    }
    return new Array(index, noOfProperties);
}

var animateCheckbox = document.querySelector('input[value="animate"]');
var animateTime = animateCheckbox.checked;
animateCheckbox.onchange = function () {
  if(animateCheckbox.checked) {
      animateTime = true;
  } else {
      animateTime = false;
  }
};

var animateSpeedSlider = document.getElementById('animate-speed');
var animateSpeed = parseFloat(animateSpeedSlider.value);
animateSpeedSlider.oninput = function () { 
    animateSpeed = animateSpeedSlider.value;
}

function lerp(a, b, t) {
    var len = a.length;
    if(b.length != len) return;

    var x = [];
    for(var i = 0; i < len; i++)
        x.push(a[i] + t * (b[i] - a[i]));
    return x;
}