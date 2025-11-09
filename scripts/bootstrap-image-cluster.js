'use strict';

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI_IMAGES;
const dbName = process.env.MONGODB_IMAGE_DB_NAME || 'apsara_image';

if (!uri) {
  console.error('❌ MONGODB_URI_IMAGES is not set. Please update your .env file.');
  process.exit(1);
}

(async () => {
  console.log('🔄 Connecting to image cluster...');

  const connection = await mongoose.createConnection(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
  }).asPromise();

  const attachmentSchema = new mongoose.Schema({
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    data: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }, { collection: 'imageattachments' });

  const ImageAttachment = connection.model('ImageAttachment', attachmentSchema);

  console.log('📁 Ensuring imageattachments collection exists...');
  await ImageAttachment.createCollection();

  console.log(`✅ Image database initialized (db: ${dbName}, collection: imageattachments)`);

  await connection.close();
  console.log('👋 Connection closed.');
})();
