import { diskStorage } from "multer";
import path from "path";

const storage = diskStorage({
  destination(req, file, callback) {
    callback(null, './uploads'); 
  },
  filename(req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // Get file extension
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    callback(null, filename);
  }
});

export default storage;
