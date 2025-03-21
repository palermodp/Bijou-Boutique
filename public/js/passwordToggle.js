function togglePassword(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(toggleId);
    
    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle del ícono del ojo
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('bx-hide');
            icon.classList.add('bx-show');
        } else {
            icon.classList.remove('bx-show');
            icon.classList.add('bx-hide');
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    togglePassword('password', 'togglePassword');
});