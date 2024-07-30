import {styleAlerte, deleteStyleAlert, regexMail, ERRORCOLOR_TEXT, SUCCESSCOLOR_BACKGROUND, SUCCESSCOLOR_TEXT,} from './ux.js';

const elBtnUpdateEmail = document.querySelector('.btnUpdateEmail');
const elAlert = document.querySelector('.alert');
const elEmail = document.querySelector('.email');
const elOldPassword = document.querySelector('.oldPassword');
const elNewPassword = document.querySelector('.newPassword');
const elFormEmail = document.querySelector('.formEmailContent form');

elEmail.addEventListener("keyup", () => deleteStyleAlert(elEmail, "Nouvelle adresse email", elAlert));
elOldPassword.addEventListener("keyup", () => deleteStyleAlert(elOldPassword, "Mot de passe actuel", elAlert));
elNewPassword.addEventListener("keyup", () => deleteStyleAlert(elNewPassword, "Nouveau mot de passe", elAlert));

elBtnUpdateEmail.addEventListener('click', async (e) => {
    e.preventDefault();
    if (validationUpdateEmailForm()) {

        const formData = new FormData(elFormEmail);
        try {
            // envoi des données au serveur avec la méthode POST
            const response = await fetch("profil", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
            const resultat = await response.json();
            if (!resultat.isSuccessful) throw new Error(resultat.message);
            elFormEmail.reset();
            elAlert.textContent = resultat.message;
            elAlert.style.backgroundColor = SUCCESSCOLOR_BACKGROUND;
            elAlert.style.color = SUCCESSCOLOR_TEXT;

        } catch (error) {
            elAlert.textContent = error.message;
            elAlert.style.color = ERRORCOLOR_TEXT;
        }
    }
})

function validationUpdateEmailForm() {
    if (elEmail.value === "") {
        styleAlerte(elEmail, "Veuillez entrer une adresse email.")
        return false;
    }
    if (!elEmail.value.match(regexMail)) {
        styleAlerte(elEmail, `L'adresse email ${elEmail.value} n'est pas valide.`)
        return false;
    }
    return true
}


