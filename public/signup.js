// Used to validate the signup form:
// will check the email address format, password length, and if the password and confirm password match.

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');
    var confirmPasswordError = document.getElementById('confirmPasswordError');

    var emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) { // email must be in the correct format
        emailError.textContent = 'Invalid email format';
        return;
    } else {
        emailError.textContent = '';
    }
    if (password.length < 8) { // password must be atleast 8 characters
        passwordError.textContent = 'Atleast 8 characters password required !!!'
        return
    }

    if (password !== confirmPassword) { // password and confirm password must match
        confirmPasswordError.textContent = 'Passwords do not match';
        return;
    } else {
        confirmPasswordError.textContent = '';
    }

    this.submit(); // if all validations pass, submit the form
});