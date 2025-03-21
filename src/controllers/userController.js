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

        if (user) {
          const passwordMatch = bcrypt.compareSync(
            req.body.password,
            user.password
          );

          if (passwordMatch) {
            req.session.usuarioLogueado = user;

            if (req.body.recordame === "recordar") {
              res.cookie("recordame", user.email, { maxAge: 600000 });
            }

            return res.redirect(`/?welcome=${encodeURIComponent(user.name)}`);
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
      return res.redirect("/?logout=true");
    });
  },
  perfil: (req, res) => {
    const user = req.session.usuarioLogueado;
    if (!user) {
      return res.redirect("/login");
    }

    return res.render("home", { user });
  },
  // Eliminar completamente este método ya que no lo usaremos más
  // success: function (req, res) {
  //     res.render("success", {
  //         user: req.session.usuarioLogueado,
  //     });
  // },
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

    try {
      console.log("ID del usuario:", user.id);
      console.log("Datos del formulario:", req.body);
      console.log("Archivo:", req.file);

      if (!req.body.name || !req.body.surname || !req.body.email) {
        throw new Error("Faltan datos requeridos");
      }

      const result = await db.User.update(
        {
          name: req.body.name,
          surname: req.body.surname,
          email: req.body.email,
          role: req.body.role,
          image: req.file ? req.file.filename : user.image,
        },
        {
          where: { id: user.id },
          returning: true,
        }
      );

      console.log("Resultado de la actualización:", result);

      const updatedUser = await db.User.findByPk(user.id);
      console.log("Usuario actualizado:", updatedUser);

      req.session.usuarioLogueado = updatedUser;

      return res.redirect("/profile");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      return res.render("editProfile", {
        user: user,
        errors: [{ msg: "Error al actualizar el perfil: " + error.message }],
      });
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

    try {
      if (!user) {
        return res.redirect("/login");
      }

      const currentUser = await db.User.findByPk(user.id);

      if (!bcrypt.compareSync(currentPassword, currentUser.password)) {
        return res.render("updatePass", {
          errors: [{ msg: "La contraseña actual es incorrecta." }],
          user,
        });
      }

      if (newPassword !== confirmPassword) {
        return res.render("updatePass", {
          errors: [{ msg: "Las nuevas contraseñas no coinciden." }],
          user,
        });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      await db.User.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );

      req.session.flashMessage =
        "Contraseña actualizada exitosamente. Por favor, inicia sesión nuevamente.";

      req.session.destroy((err) => {
        if (err) {
          console.error("Error al cerrar sesión:", err);
          return res.status(500).send("Error al procesar la solicitud");
        }
        res.clearCookie("recordame");
        return res.redirect("/login");
      });
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      return res.render("updatePass", {
        errors: [{ msg: "Error al actualizar la contraseña" }],
        user,
      });
    }
  },
}; // <-- Faltaba esta llave de cierre

module.exports = userController;
