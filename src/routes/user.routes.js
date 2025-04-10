const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middlewares/productMiddleware");
const uploadUser = require("../middlewares/userMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const guestMiddleware = require("../middlewares/guestMiddleware");
const { loginValidation } = require("../middlewares/loginValidMiddleware");
const { checkLoggedIn } = require("../middlewares/sessionMiddleware");
const validations = require("../middlewares/validationMiddleware");
const { passwordValidation } = require("../middlewares/passwordValidation");

router.get("/login", guestMiddleware, userController.login);
router.post("/login", loginValidation, userController.processLogin);
router.get("/logout", userController.logout);
router.get("/check", checkLoggedIn);

router.get("/profile", authMiddleware, userController.profile);
router.get("/profile/edit", authMiddleware, userController.editProfile);
router.post(
  "/profile/edit",
  uploadUser.single("image"),
  userController.updateProfile
);

router.get("/updatePass", userController.updatePass);
router.post("/updatePass", passwordValidation, userController.updatePassword);

router.get("/register", guestMiddleware, userController.register);
router.get("/contactUs", userController.contact);
router.post(
  "/register",
  upload.single("image"),
  validations,
  userController.create
);

module.exports = router;
