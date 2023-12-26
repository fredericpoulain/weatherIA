import { createDOM, displayAlertError, elAlertError} from './favoritesDOM.js';
const elLoading = document.querySelector('.loading');

window.addEventListener("load", async () => {
    try {
        let response = await fetch('/getFavorites');
        if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        const favoriteCities = result.data;
        if (favoriteCities !== null && favoriteCities.length > 0) {
            try {
                elLoading.classList.add('activeLoading');
                await createDOM(favoriteCities)
            } catch (e) {
                displayAlertError();
            } finally {
                elLoading.classList.remove('activeLoading');
            }
        } else {
            elAlertError.textContent = "Aucun favoris enregistrés";
            elAlertError.style.top = '150%';
            elAlertError.style.backgroundColor = 'transparent'
            elAlertError.style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur de chargement des données : ');
        console.error(error);
    }
});




