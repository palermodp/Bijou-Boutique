document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const nameInput = document.getElementById("name");
  const surnameInput = document.getElementById("surname");
  const emailInput = document.getElementById("mail");
  const passwordInput = document.getElementById("pass");
  const roleInput = document.getElementById("role");
  const imageInput = document.getElementById("image");
  const togglePassword = document.getElementById("togglePassword");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let isValid = true;
      const errors = [];

      if (!nameInput.value.trim()) {
        errors.push("El nombre es requerido");
        isValid = false;
      }

      if (!surnameInput.value.trim()) {
        errors.push("El apellido es requerido");
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        errors.push("Email inválido");
        isValid = false;
      }

      const passwordRegex =
        /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(passwordInput.value)) {
        errors.push(
          "La contraseña debe tener al menos 8 caracteres, un número y un caracter especial"
        );
        isValid = false;
      }

      // Validación de imagen
      if (imageInput && imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (!validTypes.includes(file.type)) {
          errors.push("El archivo debe ser una imagen (JPEG, PNG o GIF)");
          isValid = false;
        }

        if (file.size > 5000000) { // 5MB
          errors.push("La imagen no debe superar los 5MB");
          isValid = false;
        }
      }

      if (isValid) {
        console.log('Enviando formulario con datos:', {
          name: nameInput.value,
          surname: surnameInput.value,
          email: emailInput.value,
          role: roleInput.value,
          image: imageInput.files[0]?.name
        });
        form.submit();
      } else {
        alert(errors.join("\n"));
      }
    });
  }

  // Toggle de contraseña
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      togglePassword.classList.toggle("bx-show");
      togglePassword.classList.toggle("bx-hide");
    });
  }
});
