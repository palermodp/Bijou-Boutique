const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Guardando imagen de usuario en:", "./public/images/users");
    cb(null, "./public/images/users");
  },
  filename: (req, file, cb) => {
    const newFileName = `user-${Date.now()}${path.extname(file.originalname)}`;
    console.log("Nombre de archivo generado:", newFileName);
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Verificando archivo:", file.originalname);
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: El archivo debe ser una imagen válida (jpeg, jpg, png, gif)"));
};

const uploadUser = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

module.exports = uploadUser;