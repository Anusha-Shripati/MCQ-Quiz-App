/**
 * This script downloads face-api.js models from CDN and saves them to public/models folder.
 * Run this script before building the application.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');
const MODEL_BASE_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

const REQUIRED_MODELS = [
  // Tiny Face Detector model (faster but less accurate)
  'tiny_face_detector_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',
  
  // Face Landmark model (for facial landmarks)
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  
  // SSD MobileNet model (more accurate for multiple face detection)
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'ssd_mobilenetv1_model-weights_manifest.json'
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  console.log(`Creating models directory at ${MODELS_DIR}`);
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

// Download each model file
REQUIRED_MODELS.forEach(model => {
  const fileUrl = `${MODEL_BASE_URL}/${model}`;
  const filePath = path.join(MODELS_DIR, model);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Model ${model} already exists, skipping...`);
    return;
  }
  
  console.log(`Downloading ${model}...`);
  
  const file = fs.createWriteStream(filePath);
  https.get(fileUrl, response => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${model} successfully`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${model}:`, err.message);
  });
});

console.log('Setup script complete. If all files downloaded successfully, face-api.js models are ready to use.');
