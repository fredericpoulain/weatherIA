const allIconsFlashMessage = document.querySelectorAll('.hideFlashMessage');
allIconsFlashMessage.forEach(icon => {
    icon.addEventListener('click', flashMessage);
})

function flashMessage() {
    this.parentNode.style.display = "none";
}
