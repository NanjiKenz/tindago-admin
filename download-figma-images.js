const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

const headers = {
  'X-Figma-Token': FIGMA_ACCESS_TOKEN,
  'Content-Type': 'application/json'
};

async function downloadFigmaImages() {
  console.log('🎨 Downloading actual Figma images...');

  // Get the images for the specific nodes
  const imageNodes = ['281:5', '281:10', '281:13', '281:19', '281:28', '281:30', '281:36', '281:37', '281:43', '281:51', '281:53'];

  try {
    console.log('Fetching image export URLs...');
    const imageResponse = await axios.get(
      `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${imageNodes.join(',')}&format=png&scale=2`,
      { headers }
    );

    console.log('Image URLs response:', imageResponse.data);

    if (imageResponse.data.images) {
      // Create directories
      fs.mkdirSync('public/images/landing', { recursive: true });

      for (const [nodeId, imageUrl] of Object.entries(imageResponse.data.images)) {
        if (imageUrl) {
          console.log(`Downloading ${nodeId} from ${imageUrl}`);

          try {
            const imgResponse = await axios.get(imageUrl, { responseType: 'stream' });
            const imagePath = path.join('public/images/landing', `${nodeId.replace(':', '-')}.png`);

            const writer = fs.createWriteStream(imagePath);
            imgResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            console.log(`✅ Downloaded: ${nodeId}.png`);
          } catch (error) {
            console.error(`❌ Failed to download ${nodeId}:`, error.message);
          }
        }
      }

      console.log('🎉 All images downloaded successfully!');
    } else {
      console.log('❌ No images found in response');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

downloadFigmaImages();