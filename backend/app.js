import express from 'express';
import { generatePresignedUrl } from './fileController.js';

const app = express();
const port = 3000;

app.get('/presigned-url', generatePresignedUrl);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
