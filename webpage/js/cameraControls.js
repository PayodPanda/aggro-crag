
// https://github.com/mrdoob/three.js/blob/master/examples/js/controls/PointerLockControls.js
// adapted for dragging instead of pointer lock by Panda | http://payodpanda.com

/**
 * @author mrdoob / http://mrdoob.com/
 */

// here the camera is simply the object being controlled by the algorithm
THREE.Controls = function ( camera ) {

    //to check if mouse is clicked or not
    var mouseDown = false;

    var scope = this;

    camera.rotation.set( 0, 0, 0 );

    var pitchObject = new THREE.Object3D();
    pitchObject.add( camera );

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 10;
    yawObject.add( pitchObject );

    var PI_2 = Math.PI / 2;

    var onMouseMove = function ( event ) {
        
        if(mouseDown){
            if ( scope.enabled === false ) return;

            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            yawObject.rotation.y -= movementX * 0.002;
            pitchObject.rotation.x -= movementY * 0.002;

            pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
        }

    };

    this.dispose = function() {

        document.removeEventListener( 'mousemove', onMouseMove, false );

    };

    // update this when mouse is clicked down and released, to enable move on mouse drag
    function activateDrag(){
        mouseDown = true;
    }
    function deactivateDrag(){
        mouseDown = false;
    }

    document.getElementById('container-main').addEventListener( 'mousemove', onMouseMove, false );
    document.getElementById('container-main').addEventListener( 'mousedown', activateDrag, false );
    document.getElementById('container-main').addEventListener( 'mouseup', deactivateDrag, false );

    this.enabled = false;

    this.getObject = function () {

        return yawObject;

    };

    this.getDirection = function() {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3( 0, 0, - 1 );
        var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

        return function( v ) {

            rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

            v.copy( direction ).applyEuler( rotation );

            return v;

        };

    }();

};