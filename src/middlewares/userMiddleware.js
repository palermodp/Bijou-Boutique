const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/images/users'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadUser = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.mimetype)) {
            cb(null, false);
            return cb(new Error('Solo se permiten archivos de imagen!'));
        }
        cb(null, true);
    }
});

module.exports = uploadUser;