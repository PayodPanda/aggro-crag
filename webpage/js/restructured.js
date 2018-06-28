
// Initialization:
    // Determine layout based on URL queries.
    // Define the scenes, cameras, renderers, lights, variables.
    // Setup the controls (WSAD etc).
    // Load the data from JSON file.
    // Create coordinate grid.
    // Create the n spheres and 1x1 planes, where n = no. of samples in JSON.
    // Begin render loop

// Update functions:
    // updateSphere.
    // updateTimeline.
    // updateColor.
    // updateScrobbler.

// Event listeners:
    // Keys to control camera movement.
    // Mouse to update scrobbler location.

// Render loop:
        // Checks:
            // Data loaded?
            // Animate? Speed?
            // Dimension mapping?
    // Call appropriate update functions as necessary.
    // Render.

// General utilities:
    // Mapping function
    function map(val, min1, max1, min2, max2){
        return min2 + (max2 - min2) * (val - min1) / (max1 - min1);
    }
    
    // URL query grab
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }