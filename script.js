// Form validation and submission handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginButton = loginForm.querySelector('.btn-login');

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation
    function validatePassword(password) {
        return password.length >= 6;
    }

    // Clear error message
    function clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
    }

    // Show error message
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    // Real-time validation for email
    emailInput.addEventListener('blur', function() {
        const email = emailInput.value.trim();

        if (!email) {
            showError(emailInput, emailError, 'L\'email è obbligatoria');
        } else if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Inserisci un\'email valida');
        } else {
            clearError(emailInput, emailError);
        }
    });

    // Clear error on focus
    emailInput.addEventListener('focus', function() {
        clearError(emailInput, emailError);
    });

    // Real-time validation for password
    passwordInput.addEventListener('blur', function() {
        const password = passwordInput.value;

        if (!password) {
            showError(passwordInput, passwordError, 'La password è obbligatoria');
        } else if (!validatePassword(password)) {
            showError(passwordInput, passwordError, 'La password deve essere di almeno 6 caratteri');
        } else {
            clearError(passwordInput, passwordError);
        }
    });

    // Clear error on focus
    passwordInput.addEventListener('focus', function() {
        clearError(passwordInput, passwordError);
    });

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = document.getElementById('remember').checked;

        let isValid = true;

        // Validate email
        if (!email) {
            showError(emailInput, emailError, 'L\'email è obbligatoria');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Inserisci un\'email valida');
            isValid = false;
        } else {
            clearError(emailInput, emailError);
        }

        // Validate password
        if (!password) {
            showError(passwordInput, passwordError, 'La password è obbligatoria');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordInput, passwordError, 'La password deve essere di almeno 6 caratteri');
            isValid = false;
        } else {
            clearError(passwordInput, passwordError);
        }

        // If validation passes, simulate login
        if (isValid) {
            // Add loading state
            loginButton.classList.add('loading');
            loginButton.disabled = true;

            // Simulate API call
            setTimeout(function() {
                console.log('Login attempt with:', {
                    email: email,
                    password: '***hidden***',
                    remember: remember
                });

                // Remove loading state
                loginButton.classList.remove('loading');
                loginButton.disabled = false;

                // Show success message
                alert('Login simulato con successo!\n\nEmail: ' + email + '\nRicordami: ' + (remember ? 'Sì' : 'No') + '\n\nIn un\'applicazione reale, qui invieresti i dati al server.');

                // Reset form
                loginForm.reset();
            }, 1500);
        }
    });

    // Google login button
    const googleButton = document.querySelector('.btn-google');
    googleButton.addEventListener('click', function() {
        alert('Login con Google!\n\nIn un\'applicazione reale, qui inizieresti il flusso OAuth di Google.');
    });

    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (email && validateEmail(email)) {
            alert('Link di reset password inviato a: ' + email + '\n\nIn un\'applicazione reale, qui invieresti un\'email di reset.');
        } else {
            alert('Inserisci un\'email valida per recuperare la password.');
            emailInput.focus();
        }
    });

    // Sign up link
    const signupLink = document.querySelector('.signup-link a');
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Reindirizzamento alla pagina di registrazione...\n\nIn un\'applicazione reale, qui andresti alla pagina di signup.');
    });
});
