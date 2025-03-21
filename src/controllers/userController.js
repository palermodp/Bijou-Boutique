const userService = require("../services/userService");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../database/models");

const userController = {
  login: (req, res) => {
    res.render("login", {
      user: req.session.usuarioLogueado,
    });
  },
  processLogin: async (req, res) => {
    try {
      let errors = validationResult(req);
      console.log("\n=== DETALLES DEL INTENTO DE LOGIN ===");
      console.log("1. Datos del formulario:", {
        email: req.body.email,
        contraseñaRecibida: req.body.password,
        longitudContraseña: req.body.password?.length,
      });

      if (errors.isEmpty()) {
        let user = await userService.getUserByEmail(req.body.email);
        console.log("2. Resultado de la búsqueda en BD:", {
          usuarioEncontrado: !!user,
          datosUsuario: user
            ? {
                id: user.id,
                email: user.email,
                hashGuardado: user.password,
                rol: user.role,
              }
            : null,
        });

        if (user) {
          const passwordMatch = bcrypt.compareSync(
            req.body.password,
            user.password
          );
          console.log("3. Resultado de verificación:", passwordMatch);

          if (passwordMatch) {
            req.session.usuarioLogueado = user;

            if (req.body.recordame === "recordar") {
              res.cookie("recordame", user.email, { maxAge: 600000 });
            }

            return res.redirect("/success");
          }
        }

        return res.render("login", {
          errors: [{ msg: "Credenciales inválidas!" }],
          oldData: { email: req.body.email },
          user: null,
        });
      } else {
        return res.render("login", {
          errors: errors.errors,
          oldData: req.body,
          user: null,
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      return res.render("login", {
        errors: [{ msg: "Error al procesar el login" }],
        oldData: req.body,
        user: null,
      });
    }
  },
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("No se pudo cerrar sesión");
      }
      res.clearCookie("recordame");
      return res.redirect("/login");
    });
  },
  perfil: (req, res) => {
    const user = req.session.usuarioLogueado;
    if (!user) {
      return res.redirect("/login");
    }

    return res.render("home", { user });
  },
  success: function (req, res) {
    res.render("success", {
      user: req.session.usuarioLogueado,
    });
  },
  register: (req, res) => {
    return res.render("register", { errors: validationResult, user: null });
  },
  create: async (req, res) => {
    try {
      const existingUser = await db.User.findOne({
        where: { email: req.body.email },
      });

      if (existingUser) {
        return res.render("register", {
          errors: [{ msg: "El email ya está registrado" }],
          oldData: req.body,
          user: null,
        });
      }

      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

      const newUser = await db.User.create({
        name: req.body.name,
        surname: req.body.surname,
        password: hashedPassword,
        email: req.body.email,
        image: req.file ? req.file.filename : "default-user.png",
        role: req.body.role || "user",
      });

      console.log("Usuario creado:", {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      });

      return res.redirect("/login");
    } catch (error) {
      console.error("Error al crear usuario:", {
        message: error.message,
        stack: error.stack,
      });

      return res.render("register", {
        errors: [{ msg: "Error al crear el usuario" }],
        oldData: req.body,
        user: null,
      });
    }
  },
  contact: (req, res) => {
    return res.render("contactUs", { user: req.session.usuarioLogueado });
  },
  profile: (req, res) => {
    const user = req.session.usuarioLogueado;
    if (!user) {
      return res.redirect("/login");
    }
    return res.render("profile", { user });
  },
  editProfile: (req, res) => {
    const user = req.session.usuarioLogueado;
    if (!user) {
      return res.redirect("/login");
    }
    return res.render("editProfile", { user });
  },

  updateProfile: async (req, res) => {
    const user = req.session.usuarioLogueado;
    if (!user) {
      return res.redirect("/login");
    }

    const { name, surname, email, role } = req.body;

    try {
      await db.User.update(
        { name, surname, email, role },
        { where: { id: user.id } }
      );

      req.session.usuarioLogueado.name = name;
      req.session.usuarioLogueado.surname = surname;
      req.session.usuarioLogueado.email = email;
      req.session.usuarioLogueado.role = role;

      return res.redirect("/profile");
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: error.message });
    }
  },
  updatePass: (req, res) => {
    return res.render("updatePass", {
      user: req.session.usuarioLogueado,
      errors: [],
    });
  },
  updatePassword: async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.session.usuarioLogueado;

    if (!user) {
      return res.redirect("/login");
    }

    let errors = [];

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      errors.push({ msg: "La contraseña actual es incorrecta." });
    }

    if (newPassword !== confirmPassword) {
      errors.push({ msg: "Las nuevas contraseñas no coinciden." });
    }

    if (errors.length > 0) {
      return res.render("updatePass", {
        errors,
        user,
      });
    }

    try {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      await db.User.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );

      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send("No se pudo cerrar sesión después de cambiar la contraseña");
        }

        res.clearCookie("recordame");
        return res.redirect("/login");
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: error.message });
    }
  },
};

module.exports = userController;
