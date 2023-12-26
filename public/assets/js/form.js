
const elEmail = document.querySelector('.email');
const elUsername = document.querySelector('.userName');
const elpassword = document.querySelector('.password');
const elAlert = document.querySelector('.alert p');
const elForm = document.querySelector('form');
const elDivBtn = document.querySelector('.divBtn');
const elBtnRegister = document.querySelector('.btnRegister');
import {
    styleAlerte,
    deleteStyleAlert,
    regexMail,
    ERRORCOLOR_TEXT,
    SUCCESSCOLOR_BACKGROUND,
    SUCCESSCOLOR_TEXT,
} from './ux.js';
elEmail.addEventListener("keyup", () => deleteStyleAlert(elEmail, "Adresse email *", elAlert));
elUsername.addEventListener("keyup", () => deleteStyleAlert(elUsername, "Pseudo *", elAlert));
elpassword.addEventListener("keyup", () => deleteStyleAlert(elpassword, "Mot de passe *", elAlert));

elBtnRegister.addEventListener('click', async (e) => {
    e.preventDefault();
    if (validationRegisterForm()) {
        console.log('formulaire valide')
        const formData = new FormData(elForm);
        try {
            // envoi des données au serveur avec la méthode POST
            const response = await fetch("inscription", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
            const resultat = await response.json();
            console.log(resultat.isSuccessful)
            if (!resultat.isSuccessful) throw new Error(resultat.message);
            elForm.reset();
            elForm.style.display = "none";
            elAlert.textContent = resultat.message;
            elAlert.style.backgroundColor = SUCCESSCOLOR_BACKGROUND;
            elAlert.style.color = SUCCESSCOLOR_TEXT;

        } catch (error) {
            elAlert.textContent = error.message;
            // elAlert.style.backgroundColor = ERRORCOLOR_BACKGROUND;
            elAlert.style.color = ERRORCOLOR_TEXT;
        }
    }
})

function validationRegisterForm() {
    if (elEmail.value === "") {
        styleAlerte(elEmail, "Veuillez entrer une adresse email.")
        return false;
    }
    if (!elEmail.value.match(regexMail)) {
        styleAlerte(elEmail, `L'adresse email ${elEmail.value} n'est pas valide.`)
        return false;
    }
    if (elUsername.value === "") {
        styleAlerte(elUsername, "Veuillez entrer votre pseudo.")
        return false;
    }
    if (elpassword.value === "") {
        styleAlerte(elpassword, "Veuillez entrer un mot de passe.")
        return false;
    }
    if (elpassword.value.length < 8) {
        styleAlerte(elpassword, "Votre mot de passe doit comporter 8 caractères minimum.")
        return false;
    }
    return true
}


