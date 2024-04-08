const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


setInterval(async () => {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
  
  if (detections.length > 0) {
    const detection = detections[0]; // İlk tespit edilen yüzü al

    const expressions = detection.expressions;

    // En yüksek duygu ifadesini bulma
    const maxExpression = Object.entries(expressions).reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))[0];
    
    // Yüz ifadesi değeri geçerli mi kontrolü
    if (maxExpression && expressions[maxExpression] > 0.5) {
      const emotionPercentage = expressions[maxExpression] * 100;
      console.log(`Müşteri %${emotionPercentage.toFixed(2)} ${maxExpression}`);
    } else {
      console.log("Duygu Belirlenemedi");
    }
  } else {
    console.log("Yüz Bulunamadı");
  }

}, 10000); // Her 10 saniyede bir çalıştır


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})
