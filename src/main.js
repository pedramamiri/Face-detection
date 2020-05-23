import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';

const { Canvas  } = canvas;

faceapi.env.monkeyPatch({
    Canvas: Canvas,
    createCanvasElement: () => document.createElement('canvas'),
})

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

const video = document.getElementById("video");
const container = document.getElementById("container");

function startVideo(){
    navigator.getUserMedia(
        {video : {}},
        stream => video.srcObject = stream,
        err => console.error(err)
    )
};

video.addEventListener("play",()=>{
    const canvas = faceapi.createCanvasFromMedia(video)
    container.appendChild(canvas);
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async ()=>{
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    },10)
})
