const { check } = require("express-validator");

const loginValidation = [
  check("email")
    .notEmpty().withMessage("El email es requerido")
    .isEmail().withMessage("Email inválido"),
  check("password")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
];

module.exports = {
  loginValidation,
};
