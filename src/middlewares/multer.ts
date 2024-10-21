import multer, { diskStorage } from "multer";
import path from "path";
const storage = diskStorage({
  // destination(req, file, callback) {
  //   callback(null, '../uploads');
  // },
  filename(req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    callback(null, filename);
  }
});

const upload = multer({
  storage: storage
})

export default upload;
