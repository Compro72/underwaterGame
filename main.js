let canvas = document.getElementById("mainCanvas");
let ctx = canvas.getContext("2d", {
    desynchronized: true,
    alpha: false
});
let viewport;
let world;

let upKey = false;
let downKey = false;
let leftKey = false;
let rightKey = false;

let chunkSize = 32;
let chunkResolution = 16;
let frameCount = 0;

function openFullscreen() {
    //canvas.requestFullscreen();
}

function handleKeyDown(event) {
    if (event.key=="ArrowUp") {
        upKey = true;
    }
    if (event.key==="ArrowDown") {
        downKey = true;
    }
    if (event.key==="ArrowLeft") {
        leftKey = true;
    }
    if (event.key==="ArrowRight") {
        rightKey = true;
    }
}

function handleKeyUp(event) {
    if (event.key=="ArrowUp") {
        upKey = false;
    }
    if (event.key==="ArrowDown") {
        downKey = false;
    }
    if (event.key==="ArrowLeft") {
        leftKey = false;
    }
    if (event.key==="ArrowRight") {
        rightKey = false;
    }
}


function initialize() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    canvas.width = 1920; 
    canvas.height = 1080;

    viewport = new Viewport(0, 0);
    world = new World();
    world.attachViewport(viewport);
    loop();
}

function loop() {
    world.render();

    frameCount++;
    requestAnimationFrame(loop);
}

initialize();