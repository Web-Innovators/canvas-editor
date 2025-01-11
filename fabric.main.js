// Initialize Fabric.js canvas
var canvas = new fabric.Canvas('myCanvas');
canvas.setHeight(600);


// Listen for the selection:created event
canvas.on('selection:created', function (event) {
    // First, ensure an object is selected
    const selectedObject = event.target; // The selected object
    if (selectedObject) {
        console.log('Object selected:', selectedObject);
        // Deselect the previously selected object, if any
        if (canvas.getActiveObject()) {
            canvas.discardActiveObject();
        }
        // Optionally set this new object as active (Fabric does it automatically)
        canvas.setActiveObject(selectedObject);
        canvas.renderAll();
    } else {
        console.warn('No object selected');
    }
});
// Optional: Handle when selection is cleared (no object is selected)
canvas.on('selection:cleared', function () {
    console.log('No object selected');
});

// Function to set canvas to vertical orientation
document.getElementById('setFullScrn').addEventListener('click', function () {
    canvas.setWidth(690); // Set a narrower width
    canvas.setHeight(600); // Keep the height larger for vertical orientation
    canvas.renderAll();
});
// Function to set canvas to vertical orientation
document.getElementById('setVertical').addEventListener('click', function () {
    canvas.setWidth(400); // Set a narrower width
    canvas.setHeight(600); // Keep the height larger for vertical orientation
    canvas.renderAll();
});
// Function to set canvas to horizontal orientation
document.getElementById('setHorizontal').addEventListener('click', function () {
    canvas.setWidth(600); // Set a wider width
    canvas.setHeight(400); // Set a smaller height for horizontal orientation
    canvas.renderAll();
});
// Function to add text to the canvas
function AddText() {
    var text = new fabric.IText("Type here..", {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fill: 'black',
        fontSize: 40,
        originX: 'center',
        originY: 'center',
        shadow: {
            color: '#000000',
            blur: 5,
            offsetX: 5,
            offsetY: 5,
            opacity: 0.5
        }
    });
    text.setControlsVisibility({
        mt: false, // disable top middle control
        mb: false, // disable bottom middle control
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing(); // Enable text editing
    canvas.renderAll();
    updateLayerBoxes();
}
document.getElementById('addTextButton').addEventListener('click', function () {
    AddText();
});
// Change text color
document.getElementById('textColorPicker').addEventListener('input', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fill', this.value);
        canvas.renderAll();
    }
});
// Add an event listener to update opacity when the range slider changes
document.getElementById('opacityRange').addEventListener('input', function () {
    var selectedObject = canvas.getActiveObject();
    var opacityValue = this.value;
    if (selectedObject) {
        selectedObject.set('opacity', opacityValue);
        canvas.renderAll();
    } else {
        alert('Please select an object to change opacity.');
    }
});
// Set the width to 100% of the parent container
var canvasContainer = document.querySelector('.preview-img');
canvas.setWidth(canvasContainer.clientWidth);
canvas.setBackgroundColor('#d6d6d6a8');
var brush = new fabric.PencilBrush(canvas);
brush.color = 'black'; // Default brush color
brush.width = 10; // Default brush width
var canvasStates = [];
var currentStateIndex = -1;
// Change canvas background color
document.getElementById('canvasBgColor').addEventListener('input', function () {
    canvas.setBackgroundColor(this.value, canvas.renderAll.bind(canvas));
});
var _clipboard;
var undoStack = [];
// Save current canvas state to undo stack
function saveState() {
    var json = canvas.toJSON();
    undoStack.push(json);
}
// Function to copy the active object
function Copy() {
    canvas.getActiveObject().clone(function (cloned) {
        _clipboard = cloned;
    });
}
// Function to paste the copied object
function Paste() {
    if (!_clipboard) return; // Ensure there's something to paste
    _clipboard.clone(function (clonedObj) {
        canvas.discardActiveObject();
        clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
        });
        if (clonedObj.type === 'activeSelection') {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject(function (obj) {
                canvas.add(obj);
            });
            clonedObj.setCoords();
        } else {
            canvas.add(clonedObj);
        }
        _clipboard.top += 10;
        _clipboard.left += 10;
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
    });
}
// Event listener for keydown event
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'c') {
        Copy();
    }
    if (e.ctrlKey && e.key === 'v') {
        Paste();
    }
});

function attachImageClickEvent() {
    document.querySelectorAll('.canvas-img').forEach(function (img) {
        img.addEventListener('click', function () {
            document.querySelectorAll('.canvas-img').forEach(function (image) {
                image.style.border = 'none'; // Remove border from all images
            });
            img.style.border = '2px solid red'; // Highlight selected image with red border
            selectedImgSrc = img.getAttribute('data-img-src'); // Store selected image source
        });
    });
}

// Declare selectedImgSrc in the global scope
let selectedImgSrc = null;

function attachImageClickEvent() {
    // Ensure the selected image is stored when an image is clicked
    document.querySelectorAll('.canvas-img').forEach(function (img) {
        img.addEventListener('click', function () {
            document.querySelectorAll('.canvas-img').forEach(function (image) {
                image.style.border = 'none'; // Remove border from all images
            });
            img.style.border = '2px solid red'; // Highlight selected image with red border
            selectedImgSrc = img.getAttribute('data-img-src'); // Store selected image source
        });
    });
}

// Button to load the selected image onto the canvas
document.getElementById('selectImageButton').addEventListener('click', function () {
    if (selectedImgSrc) {
        loadImageOntoCanvas(selectedImgSrc); // Load selected image onto the canvas
        clearModalData(); // Clear modal data after loading the image
    } else {
        console.log('No image selected');
    }
});

// Function to load the selected image onto the Fabric.js canvas
function loadImageOntoCanvas(imgSrc) {
    fabric.Image.fromURL(imgSrc, function (oImg) {
        const maxTextureSize = 8192; // Set the maximum texture size
        let width = oImg.width;
        let height = oImg.height;
        // If the image is larger than the max texture size, scale it down proportionally
        if (width > maxTextureSize || height > maxTextureSize) {
            const scalingFactor = Math.min(maxTextureSize / width, maxTextureSize / height);
            oImg.scale(scalingFactor);
        }
        // Set the image width and height, scaled proportionally
        oImg.scaleToWidth(400); // Adjust this size to your desired canvas size
        oImg.scaleToHeight(400); // Adjust this size to your desired canvas size
        // Center the image on the canvas
        oImg.set({
            left: canvas.getWidth() / 2 - oImg.getScaledWidth() / 2,
            top: canvas.getHeight() / 2 - oImg.getScaledHeight() / 2
        });
        // Add the image to the canvas and set it as the active object
        canvas.add(oImg);
        canvas.setActiveObject(oImg);
        activeImgObj = oImg;
        // Render the canvas
        canvas.renderAll();
        updateLayerBoxes();
    });
}

// Function to clear the modal data and reset the selected image
function clearModalData() {
    $('#partialImgs .mainBody').html(''); // Clear the content in the modal
    $('#spinner').attr('hidden', ''); // Hide the spinner if it's visible
    selectedImgSrc = null; // Reset the selected image source
}


// Rainbow Brush
var RainbowBrush = fabric.util.createClass(fabric.PencilBrush, {
    initialize: function (canvas) {
        this.canvas = canvas;
        this.points = [];
        this.width = 10; // Default brush size
        this.opacity = 1; // Default opacity
    },
    onMouseDown: function (pointer) {
        this.points.length = 0;
        this.canvas.contextTop.moveTo(pointer.x, pointer.y);
        this.points.push(pointer);
        this._reset();
    },
    onMouseMove: function (pointer) {
        this.points.push(pointer);
        this._render();
    },
    onMouseUp: function () {
        this._finalizeAndAddPath();
    },
    _render: function () {
        if (this.points.length < 2) {
            return;
        }
        var ctx = this.canvas.contextTop;
        ctx.lineWidth = this.width;
        ctx.lineCap = this.strokeLineCap;
        ctx.lineJoin = this.strokeLineJoin;
        var gradient = ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, `rgba(255, 0, 0, ${this.opacity})`); // Red
        gradient.addColorStop(1 / 6, `rgba(255, 165, 0, ${this.opacity})`); // Orange
        gradient.addColorStop(2 / 6, `rgba(255, 255, 0, ${this.opacity})`); // Yellow
        gradient.addColorStop(3 / 6, `rgba(0, 128, 0, ${this.opacity})`); // Green
        gradient.addColorStop(4 / 6, `rgba(0, 0, 255, ${this.opacity})`); // Blue
        gradient.addColorStop(5 / 6, `rgba(75, 0, 130, ${this.opacity})`); // Indigo
        gradient.addColorStop(1, `rgba(238, 130, 238, ${this.opacity})`); // Violet
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
    },
    _finalizeAndAddPath: function () {
        if (this.points.length < 2) {
            return;
        }
        var pathData = this.convertPointsToSVGPath(this.points).join('');
        if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
            this.canvas.renderAll();
            return;
        }
        var path = this.createPath(pathData);
        path.set({
            stroke: new fabric.Gradient({
                type: 'linear',
                gradientUnits: 'percentage',
                coords: {
                    x1: 0,
                    y1: 0,
                    x2: 1,
                    y2: 0
                },
                colorStops: [{
                    offset: 0,
                    color: `rgba(255, 0, 0, ${this.opacity})`
                },
                {
                    offset: 1 / 6,
                    color: `rgba(255, 165, 0, ${this.opacity})`
                },
                {
                    offset: 2 / 6,
                    color: `rgba(255, 255, 0, ${this.opacity})`
                },
                {
                    offset: 3 / 6,
                    color: `rgba(0, 128, 0, ${this.opacity})`
                },
                {
                    offset: 4 / 6,
                    color: `rgba(0, 0, 255, ${this.opacity})`
                },
                {
                    offset: 5 / 6,
                    color: `rgba(75, 0, 130, ${this.opacity})`
                },
                {
                    offset: 1,
                    color: `rgba(238, 130, 238, ${this.opacity})`
                }
                ]
            }),
            strokeWidth: this.width,
            fill: null
        });
        this.canvas.add(path);
        this.canvas.renderAll();
    },
    _reset: function () {
        this.canvas.clearContext(this.canvas.contextTop);
    }
});

var rainbowBrush = new RainbowBrush(canvas);

document.getElementById('enableRainbowBrush').addEventListener('click', function () {
    canvas.freeDrawingBrush = rainbowBrush;
    canvas.isDrawingMode = true;
    updateCursorStyle();
});

document.getElementById('brushSize').addEventListener('input', function () {
    rainbowBrush.width = parseInt(this.value, 10);
});

document.getElementById('brushOpacity').addEventListener('input', function () {
    rainbowBrush.opacity = parseFloat(this.value);
});
// Function to enable drawing mode with specified brush
function enableDrawingMode(brush) {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = brush;
}
// Enable brush drawing mode
document.getElementById('enableBrush').addEventListener('click', function () {
    enableDrawingMode(brush);
});
// Disable drawing mode
document.getElementById('disableBrush').addEventListener('click', function () {
    canvas.isDrawingMode = false;
});
// Change brush color
document.getElementById('brushColor').addEventListener('input', function () {
    brush.color = this.value;
});
// Change brush size
document.getElementById('brushSize').addEventListener('input', function () {
    brush.width = parseInt(this.value, 10);
});
// Enable eraser mode
document.getElementById('enableEraser').addEventListener('click', function () {
    enableEraserMode();
});

// Define the ErasedGroup class
const ErasedGroup = fabric.util.createClass(fabric.Group, {
    original: null,
    erasedPath: null,
    initialize: function (original, erasedPath, options, isAlreadyGrouped) {
        this.original = original;
        this.erasedPath = erasedPath;
        this.callSuper('initialize', [this.original, this.erasedPath], options, isAlreadyGrouped);
    },
    _calcBounds: function (onlyWidthHeight) {
        const aX = [],
            aY = [],
            props = ['tr', 'br', 'bl', 'tl'],
            jLen = props.length,
            ignoreZoom = true;
        let o = this.original;
        o.setCoords(ignoreZoom);
        for (let j = 0; j < jLen; j++) {
            let prop = props[j];
            aX.push(o.oCoords[prop].x);
            aY.push(o.oCoords[prop].y);
        }
        this._getBounds(aX, aY, onlyWidthHeight);
    },
});

// Define the EraserBrush class
const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {
    _finalizeAndAddPath: function () {
        var ctx = this.canvas.contextTop;
        ctx.closePath();
        if (this.decimate) {
            this._points = this.decimatePoints(this._points, this.decimate);
        }
        var pathData = this.convertPointsToSVGPath(this._points).join('');
        if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
            this.canvas.requestRenderAll();
            return;
        }
        var path = this.createPath(pathData);
        path.globalCompositeOperation = 'destination-out'; // Ensures that the path removes pixels
        path.selectable = false;
        path.evented = false;
        path.absolutePositioned = true;

        // Objects that intersect with the eraser path
        const objects = this.canvas.getObjects().filter((obj) => obj.intersectsWithObject(path));

        if (objects.length > 0) {
            const mergedGroup = new fabric.Group(objects);
            const newPath = new ErasedGroup(mergedGroup, path);
            const left = newPath.left;
            const top = newPath.top;
            const newData = newPath.toDataURL({
                withoutTransform: true
            });

            // Convert the erased group into an image and replace the original objects
            fabric.Image.fromURL(newData, (fabricImage) => {
                fabricImage.set({
                    left: left,
                    top: top,
                });
                this.canvas.remove(...objects); // Remove the original objects
                this.canvas.add(fabricImage); // Add the new "erased" image
            });
        }

        this.canvas.clearContext(this.canvas.contextTop);
        this.canvas.renderAll();
        this._resetShadow();
    }
});

// Function to enable eraser mode
function enableEraserMode() {
    console.log('Eraser mode enabled');
    const eraserBrush = new EraserBrush(canvas);
    eraserBrush.width = 10; // You can adjust this value
    canvas.freeDrawingBrush = eraserBrush;
    canvas.isDrawingMode = true;
}


// Store the filter functions without range-dependent filters
var filterFunctions = {
    'grayscale': fabric.Image.filters.Grayscale,
    'invert': fabric.Image.filters.Invert,
    'remove-color': fabric.Image.filters.RemoveColor,
    'sepia': fabric.Image.filters.Sepia,
    'brownie': fabric.Image.filters.Brownie,
    'vintage': fabric.Image.filters.Vintage,
    'technicolor': fabric.Image.filters.Technicolor,
    'polaroid': fabric.Image.filters.Polaroid,
    'kodachrome': fabric.Image.filters.Kodachrome,
    'blackwhite': fabric.Image.filters.BlackWhite,
    'blend-image': fabric.Image.filters.BlendImage
};

// Disable inputs when no selection is made
canvas.on({
    'selection:created': function () {
        document.getElementById('filter-select').disabled = false; // Enable when an image is selected
    },
    'selection:cleared': function () {
        document.getElementById('filter-select').disabled = true; // Disable when selection is cleared
    }
});

// Create a Fabric canvas with the context that has the willReadFrequently attribute
var context = canvas.getContext('2d', {
    willReadFrequently: true
});
// Initialize the Canvas 2D backend
fabric.filterBackend = new fabric.Canvas2dFilterBackend();

function applySelectedFilter(filterName) {
    var activeImgObj = canvas.getActiveObject();

    if (!activeImgObj || activeImgObj.type !== 'image') {
        console.warn('No active image object selected or it is not an image.');
        return;
    }

    console.log(`Applying filter to image of size: ${activeImgObj.width} x ${activeImgObj.height}`);

    // Clear existing filters
    activeImgObj.filters = [];

    // Special handling for 'blend-color' filter
    if (filterName === 'blend-color') {
        var blendColorFilter = new fabric.Image.filters.BlendColor({
            color: '#FF0000', // Replace with the color you want to blend
            mode: ' ', // Choose a blend mode like 'multiply', 'overlay', etc.
            alpha: 0.5 // Adjust the alpha (transparency)
        });
        activeImgObj.filters.push(blendColorFilter);
        activeImgObj.applyFilters();
        canvas.renderAll();
    }
    // For other filters
    else if (filterName && filterFunctions[filterName]) {
        try {
            activeImgObj.filters.push(new filterFunctions[filterName]());
            activeImgObj.applyFilters();
            canvas.renderAll();
        } catch (error) {
            console.error('Error applying filter:', error);
        }
    } else {
        console.warn('Unknown filter:', filterName);
    }
}

// Event listener for filter selection
document.getElementById('filter-select').addEventListener('change', function (event) {
    applySelectedFilter(event.target.value);
});

// Function to get the selected image object
function getSelectedImage() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
        return activeObject;
    }
    return null;
}

// Function to apply filter and render the canvas
function applyFilter(index, filter) {
    const img = getSelectedImage();
    if (img) {
        img.filters[index] = filter;
        img.applyFilters();
        canvas.renderAll();
    }
}

// Event listeners for filters
document.getElementById('opacityRange').addEventListener('input', function () {
    const img = getSelectedImage();
    if (img) {
        img.set('opacity', parseFloat(this.value));
        canvas.renderAll();
    }
});

document.getElementById('brightness').addEventListener('input', function () {
    applyFilter(0, new fabric.Image.filters.Brightness({
        brightness: parseFloat(this.value)
    }));
});

document.getElementById('contrast').addEventListener('input', function () {
    applyFilter(1, new fabric.Image.filters.Contrast({
        contrast: parseFloat(this.value)
    }));
});

document.getElementById('saturation').addEventListener('input', function () {
    applyFilter(2, new fabric.Image.filters.Saturation({
        saturation: parseFloat(this.value)
    }));
});

document.getElementById('hue').addEventListener('input', function () {
    applyFilter(3, new fabric.Image.filters.HueRotation({
        rotation: parseFloat(this.value)
    }));
});

document.getElementById('vibrance').addEventListener('input', function () {
    applyFilter(4, new fabric.Image.filters.Vibrance({
        vibrance: parseFloat(this.value)
    }));
});

document.getElementById('noise').addEventListener('input', function () {
    applyFilter(5, new fabric.Image.filters.Noise({
        noise: parseInt(this.value, 10)
    }));
});

document.getElementById('pixelate').addEventListener('input', function () {
    applyFilter(6, new fabric.Image.filters.Pixelate({
        blocksize: parseInt(this.value, 10)
    }));
});

document.getElementById('blur').addEventListener('input', function () {
    applyFilter(7, new fabric.Image.filters.Blur({
        blur: parseFloat(this.value)
    }));
});

document.getElementById('sharpen').addEventListener('input', function () {
    applyFilter(8, new fabric.Image.filters.Sharpen());
});

document.getElementById('emboss').addEventListener('input', function () {
    applyFilter(9, new fabric.Image.filters.Emboss({
        emboss: parseFloat(this.value)
    }));
});

document.getElementById('gammaRed').addEventListener('input', function () {
    applyFilter(10, new fabric.Image.filters.Gamma({
        gamma: [parseFloat(this.value), 1, 1]
    }));
});

document.getElementById('gammaGreen').addEventListener('input', function () {
    applyFilter(11, new fabric.Image.filters.Gamma({
        gamma: [1, parseFloat(this.value), 1]
    }));
});

document.getElementById('gammaBlue').addEventListener('input', function () {
    applyFilter(12, new fabric.Image.filters.Gamma({
        gamma: [1, 1, parseFloat(this.value)]
    }));
});



// Adding event listener for the swap black and white colors button
document.getElementById('invertColor').addEventListener('click', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
        // Access image's original element and get the context for pixel manipulation
        var imgElement = activeObject._element;
        var canvasEl = document.createElement('canvas');
        canvasEl.width = imgElement.width;
        canvasEl.height = imgElement.height;

        var ctx = canvasEl.getContext('2d');
        ctx.drawImage(imgElement, 0, 0);

        // Get the pixel data of the image
        var imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        var data = imageData.data;

        // Loop through all pixels (RGBA values)
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i]; // Red channel
            var g = data[i + 1]; // Green channel
            var b = data[i + 2]; // Blue channel

            // Check if the pixel is black (r, g, b all close to 0) and change it to white
            if (r < 10 && g < 10 && b < 10) {
                data[i] = 255; // Set red to white
                data[i + 1] = 255; // Set green to white
                data[i + 2] = 255; // Set blue to white
            }
            // Check if the pixel is white (r, g, b all close to 255) and change it to black
            else if (r > 245 && g > 245 && b > 245) {
                data[i] = 0; // Set red to black
                data[i + 1] = 0; // Set green to black
                data[i + 2] = 0; // Set blue to black
            }
        }

        // Put the modified pixel data back into the canvas
        ctx.putImageData(imageData, 0, 0);

        // Update the fabric image with the new swapped color image
        var newImageSrc = canvasEl.toDataURL();
        fabric.Image.fromURL(newImageSrc, function (oImg) {
            // Keep the same position and scaling as the original image
            oImg.set({
                left: activeObject.left,
                top: activeObject.top,
                scaleX: activeObject.scaleX,
                scaleY: activeObject.scaleY,
                angle: activeObject.angle
            });

            canvas.remove(activeObject); // Remove the old image
            canvas.add(oImg); // Add the new image
            canvas.renderAll();
        });
    }
});

// Adding event listener for the invert button
document.getElementById('invertButton').addEventListener('click', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Flip the object horizontally (mirror effect)
        activeObject.set('flipX', !activeObject.flipX);
        canvas.renderAll();
    }
});

// Toggle drawing mode and update cursor
document.getElementById('paintBrushButton').addEventListener('click', function () {
    enableSprayMode();
    updateCursorStyle();
});
// Update brush color
document.getElementById('brushColorPicker').addEventListener('input', function () {
    canvas.freeDrawingBrush.color = this.value;
});
// Enable eraser mode by using a transparent color brush
function enableSprayMode() {
    canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
    canvas.freeDrawingBrush.width = 35;
    canvas.isDrawingMode = true;
}

// Update brush color
document.getElementById('selectObj').addEventListener('click', function () {
    enableSelectionMode();
});
// Enable eraser mode by using a transparent color brush
function enableSelectionMode() {
    canvas.isDrawingMode = false;
}

// Zoom in/out on mouse wheel scroll (Ctrl + Scroll)
canvas.on('mouse:wheel', function (options) {
    var delta = options.e.deltaY;
    var zoomRatio = 1.1; // Zoom ratio
    var pointer = canvas.getPointer(options.e);

    if (options.e.ctrlKey) {
        if (delta > 0) {
            // Zoom out
            zoomRatio = 1 / zoomRatio;
        }
        var zoom = canvas.getZoom() * zoomRatio;
        canvas.zoomToPoint({
            x: options.e.offsetX,
            y: options.e.offsetY
        }, zoom);
        options.e.preventDefault();
        options.e.stopPropagation();
    }
});

var backgroundImg = null; // To hold the background image
var activeImgObj = null;
// Set the background color of the canvas
canvas.setBackgroundColor('#d6d6d6a8', canvas.renderAll.bind(canvas));

// drawing
var isDrawing = false; // To track drawing state
// Update cursor style based on drawing mode
function updateCursorStyle() {
    if (isDrawing) {
        canvas.defaultCursor = 'url("https://cdn-icons-png.flaticon.com/512/214/214275.png")';
    } else {
        canvas.defaultCursor = 'default';
    }
}


document.getElementById('addFontFamily').addEventListener('change', function () {
    var selectedFont = this.value;
    var selectedOption = this.options[this.selectedIndex];
    var fontUrl = selectedOption.getAttribute('data-font-url');
    var activeObject = canvas.getActiveObject();

    // Log the selected font and its URL
    console.log('Selected Font Family:', selectedFont);
    console.log('Font URL:', fontUrl);

    if (activeObject && activeObject.type === 'i-text') {
        if (selectedFont) {
            // Create a new <style> element to define @font-face
            var style = document.createElement('style');
            style.type = 'text/css';

            var fontFace = `
        @font-face {
            font-family: '${selectedFont}';
            src: url('${fontUrl}') format('${fontUrl.endsWith(".ttf") ? 'truetype' : 'opentype'}');
            font-weight: normal;
            font-style: normal;
        }
    `;
            style.appendChild(document.createTextNode(fontFace));
            document.head.appendChild(style);

            // Use WebFont to check if the font loads correctly
            WebFont.load({
                custom: {
                    families: [selectedFont],
                    urls: [fontUrl]
                },
                active: function () {
                    console.log('Font loaded successfully:', selectedFont);
                    // Apply the font to the canvas object
                    activeObject.set('fontFamily', selectedFont);
                    canvas.renderAll();
                },
                inactive: function () {
                    console.error('Failed to load font:', selectedFont);
                }
            });
        }
    }
});


document.getElementById('textShadowColor').addEventListener('input', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        if (!activeObject.shadow) {
            activeObject.setShadow({
                color: this.value,
                blur: 10,
                offsetX: 5,
                offsetY: 5
            });
        } else {
            activeObject.shadow.color = this.value;
        }
        canvas.renderAll();
    }
});
// Change text shadow offset X in real-time
document.getElementById('textShadowOffsetX').addEventListener('input', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        if (!activeObject.shadow) {
            activeObject.setShadow({
                color: '#000000',
                blur: 10,
                offsetX: parseInt(this.value, 10),
                offsetY: 0
            });
        } else {
            activeObject.shadow.offsetX = parseInt(this.value, 10);
        }
        canvas.renderAll();
    }
});

// Change text shadow offset Y in real-time
document.getElementById('textShadowOffsetY').addEventListener('input', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        if (!activeObject.shadow) {
            activeObject.setShadow({
                color: '#000000',
                blur: 10,
                offsetX: 0,
                offsetY: parseInt(this.value, 10)
            });
        } else {
            activeObject.shadow.offsetY = parseInt(this.value, 10);
        }
        canvas.renderAll();
    }
});

// Change text shadow blur in real-time
document.getElementById('textShadowBlur').addEventListener('input', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        if (!activeObject.shadow) {
            activeObject.setShadow({
                color: '#000000',
                blur: parseInt(this.value, 10),
                offsetX: 0,
                offsetY: 0
            });
        } else {
            activeObject.shadow.blur = parseInt(this.value, 10);
        }
        canvas.renderAll();
    }
});

// Change font size in real-time
document.getElementById('fontSize').addEventListener('input', function () {
    var fontSize = this.value;
    var activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontSize', parseInt(fontSize, 10));
        canvas.renderAll();
    }
});

// Function to resize image
function resizeImage(image, maxWidth, maxHeight) {
    var width = image.width;
    var height = image.height;

    if (width > maxWidth) {
        height = Math.round((maxWidth / width) * height);
        width = maxWidth;
    }

    if (height > maxHeight) {
        width = Math.round((maxHeight / height) * width);
        height = maxHeight;
    }

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL();
}
// Handle background image upload
// document.querySelector('.choose-bg').addEventListener('click', function () {
//     document.querySelector('.back-file-input').click();
// });
// document.querySelector('.back-file-input').addEventListener('change', function (e) {
//     var file = e.target.files[0];
//     var reader = new FileReader();
//     reader.onload = function (event) {
//         var imgObj = new Image();
//         imgObj.src = event.target.result;
//         imgObj.onload = function () {
//             var resizedImageDataUrl = resizeImage(imgObj, 1920, 1080); // Resize to max 1920x1080
//             fabric.Image.fromURL(resizedImageDataUrl, function (img) {
//                 img.scaleToWidth(canvas.width);
//                 img.scaleToHeight(canvas.height);
//                 canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
//                 img.set({
//                     selectable: false,
//                     hasControls: true
//                 });
//                 canvas.setActiveObject(img);
//                 backgroundImg = img;
//                 canvas.renderAll();
//                 updateLayerBoxes();
//             });
//         };
//     };
//     reader.readAsDataURL(file);
// });




canvas.on('object:added', function (e) {
    if (backgroundImg) {
        backgroundImg.moveTo(0); // Move the background image to the bottom of the stack
        canvas.sendToBack(backgroundImg); // Ensure it's at the back
    }
});

// Handle main image upload
document.querySelector('.choose-img').addEventListener('click', function () {
    document.querySelector('.file-input').click();
});

// Resize the image before processing to avoid memory overload
document.querySelector('.file-input').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
        var imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
            // Create a canvas to resize the image
            var tempCanvas = document.createElement('canvas');
            var ctx = tempCanvas.getContext('2d');

            // Resize if the image exceeds 1000px in width or height
            var maxSize = 1000;
            var width = imgObj.width;
            var height = imgObj.height;

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = (maxSize / width) * height;
                    width = maxSize;
                } else {
                    width = (maxSize / height) * width;
                    height = maxSize;
                }
            }

            // Set new dimensions to the temporary canvas
            tempCanvas.width = width;
            tempCanvas.height = height;

            // Draw the resized image
            ctx.drawImage(imgObj, 0, 0, width, height);

            // Create a fabric.js image from the resized canvas
            fabric.Image.fromURL(tempCanvas.toDataURL(), function (img) {
                canvas.add(img);
                img.center();
                img.setCoords();
                canvas.setActiveObject(img);
                activeImgObj = img;
                canvas.renderAll();
                updateLayerBoxes();
            });
        };
    };

    reader.readAsDataURL(file);
});

fabric.enableRetinaScaling = true;
// fabric.enableGLFiltering = true;

function getColorMatrix(hex) {
    var rgb = hexToRgb(hex);
    if (!rgb) {
        return null;
    }
    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;

    return [
        r, 0, 0, 0, 0,
        0, g, 0, 0, 0,
        0, 0, b, 0, 0,
        0, 0, 0, 1, 0
    ];
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length !== 6) {
        return null;
    }
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return {
        r: r,
        g: g,
        b: b
    };
}

// Set default brightness and contrast filter to image
function addFiltersToImage(image) {
    image.filters.push(new fabric.Image.filters.Brightness({
        brightness: 0
    }));
    image.filters.push(new fabric.Image.filters.Contrast({
        contrast: 0
    }));
    image.applyFilters();
}

// Function to clear the canvas
function clearCanvas() {
    canvas.clear();
    canvas.setBackgroundColor('#d6d6d6a8', canvas.renderAll.bind(canvas)); // Reset background color
}

// save image
var saveButton = document.querySelector('.save-img');
var increment = 1;

saveButton.addEventListener('click', function () {
    var imgWidth = parseInt(document.getElementById('imgWidth').value);
    var imgHeight = parseInt(document.getElementById('imgHeight').value);
    var uEmail = document.getElementById('user-email').value;
    var chooseBg = document.getElementById('chooseBg').value;
    saveCanvasAsImage(imgWidth, imgHeight, uEmail, chooseBg);
    console.log(imgWidth, imgHeight, uEmail, chooseBg);

});

function saveCanvasAsImage(width, height, uEmail, chooseBg) {
    // Temporarily set canvas background color to null (so it's transparent)
    var originalBgColor = canvas.backgroundColor;
    canvas.backgroundColor = null; // This removes the background color
    // Create a temporary canvas for resizing the image
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Draw the resized canvas content to the temporary canvas
    var dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: width / canvas.getWidth(), // Scale the image to the new size
        enableRetinaScaling: true
    });
    // Restore the original background color
    canvas.backgroundColor = originalBgColor;
    // Create a download link and save the image
    var link = document.createElement('a');
    link.href = dataUrl;
    var filename = 'edited-image-' + increment + '.png';
    link.download = filename;
    link.click();
    sendImageToServer(dataUrl, uEmail, chooseBg, width, height)
    increment++;
}
function sendImageToServer(imageData, email, chooseBg, width, height) {

    $.ajax({
        url: '/save-sticker', // Use the route URL passed from the Blade template
        type: 'POST',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Fetch CSRF token
        },
        data: {
            image: imageData,
            email: email,
            width: width,
            height: height,
            bgType: chooseBg,
        },
        success: function (response) {
            console.log('Image saved successfully:', response);
        },
        error: function (xhr, status, error) {
            console.error('Error saving image:', error);
        }
    });
}


// Rotate the active object left
document.getElementById('left').addEventListener('click', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.rotate(activeObject.angle - 15);
        canvas.renderAll();
    }
});

// Rotate the active object right
document.getElementById('right').addEventListener('click', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.rotate(activeObject.angle + 15);
        canvas.renderAll();
    }
});

// Event listener for deleting the selected object using the delete key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Delete') {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
            updateLayerBoxes();
        }
    }
});
// Add event listener to the button
document.getElementById('undoButton').addEventListener('click', function () {
    undo();
});
// Event listener for deleting the selected object using the delete key
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'z') {
        undo();
    }
});
// Save state whenever an object is added, modified, or removed
canvas.on('object:added', saveCanvasState);
canvas.on('object:modified', saveCanvasState);
canvas.on('object:removed', saveCanvasState);
// Add event listener to the canvas
var canvasStates = [];
var currentStateIndex = -1;
// Function to save the current canvas state
function saveCanvasState() {
    var json = JSON.stringify(canvas);
    canvasStates.push(json);
    currentStateIndex++;
}
// Function to undo the last action
function undo() {
    if (currentStateIndex > 0) {
        currentStateIndex--;
        var json = canvasStates[currentStateIndex];
        canvas.loadFromJSON(json, function () {
            canvas.renderAll();
        });
    }
}
saveState();


// Function to update the layer boxes when a new object is added
var layers = [];
// // Function to update the layer boxes
function updateLayerBoxes() {
    var layerSelect = document.getElementById('layerSelect');
    layerSelect.innerHTML = ''; // Reset layer boxes

    // Add a box for each object in the canvas
    canvas.getObjects().forEach((obj, index) => {
        var layerBox = document.createElement('div');
        layerBox.classList.add('layer-box');
        layerBox.setAttribute('data-index', index);

        // For text objects, create a mini canvas to preview the text
        // For text objects, create a mini canvas to preview the text
        if (obj.type === 'text') {
            var miniCanvas = document.createElement('canvas');
            miniCanvas.width = 100;
            miniCanvas.height = 100;
            var miniCtx = miniCanvas.getContext('2d');

            // Get the bounding rect to calculate the actual width and height
            var boundingRect = obj.getBoundingRect();
            var scaleFactor = Math.min(90 / boundingRect.width, 90 / boundingRect.height);

            // Set the font and scale it appropriately
            miniCtx.font = `${Math.floor(obj.fontSize * scaleFactor)}px ${obj.fontFamily}`;
            miniCtx.fillStyle = obj.fill;
            miniCtx.textAlign = 'center';
            miniCtx.textBaseline = 'middle';

            // Add text to the mini canvas
            miniCtx.fillText(obj.text, miniCanvas.width / 2, miniCanvas.height / 2);

            // Append mini canvas to the layer box
            layerBox.appendChild(miniCanvas);
        }

        // Add preview for image objects
        if (obj.type === 'image') {
            var imgDataURL = obj.toDataURL();
            layerBox.innerHTML = `<img src="${imgDataURL}" alt="Layer ${index + 1}">`;
        }

        // Highlight selected layer
        if (canvas.getActiveObject() === obj) {
            layerBox.classList.add('selected-layer');
        }

        // Event listener to select the layer on click
        layerBox.addEventListener('click', function () {
            var layerIndex = this.getAttribute('data-index');
            selectLayer(layerIndex);
        });

        // Append layer box to the container
        layerSelect.appendChild(layerBox);
    });
}
// Function to select and activate a layer
function selectLayer(layerIndex) {
    if (layerIndex !== "") {
        canvas.discardActiveObject();
        var objectToSelect = canvas.getObjects()[layerIndex];
        canvas.setActiveObject(objectToSelect);
        objectToSelect.set({
            selectable: true,
            evented: true
        });
        canvas.renderAll();
        updateLayerBoxes();
        toggleLayerButtons(true); // Enable the move buttons when a layer is selected
    } else {
        canvas.discardActiveObject();
        canvas.getObjects().forEach(obj => {
            obj.set({
                selectable: false,
                evented: false
            });
        });
        canvas.renderAll();
        updateLayerBoxes();
        toggleLayerButtons(false); // Disable the move buttons when no layer is selected
    }
}

// Function to move the selected layer up
function moveLayerUp() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        var idx = canvas.getObjects().indexOf(activeObject);
        if (idx < canvas.getObjects().length - 1) {
            canvas.moveTo(activeObject, idx + 1); // Move the object up in the stack
            updateLayerBoxes();
        }
    }
}

// Function to move the selected layer down
function moveLayerDown() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        var idx = canvas.getObjects().indexOf(activeObject);
        if (idx > 0) {
            canvas.moveTo(activeObject, idx - 1); // Move the object down in the stack
            updateLayerBoxes();
        }
    }
}

// Function to enable/disable layer movement buttons
function toggleLayerButtons(enable) {
    document.getElementById('moveUp').disabled = !enable;
    document.getElementById('moveDown').disabled = !enable;
}

// Event listeners for the Move Up and Move Down buttons
document.getElementById('moveUp').addEventListener('click', moveLayerUp);
document.getElementById('moveDown').addEventListener('click', moveLayerDown);

// Initially disable the move buttons
toggleLayerButtons(false);

// Initially disable editing of all objects
canvas.getObjects().forEach(obj => {
    obj.set({
        selectable: false,
        evented: false
    });
});

// Update layer boxes initially
updateLayerBoxes();