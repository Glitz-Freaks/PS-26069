import dotenv from 'dotenv';
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[API GATEWAY] Express server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.warn(`[API GATEWAY] DB error (${err.message}). Starting server in standalone mode.`);
    app.listen(PORT, () => {
      console.log(`[API GATEWAY] Express server running on http://localhost:${PORT} (fallback mode)`);
    });
  });