export const getLocalStorage = key => JSON.parse(localStorage.getItem(key));
export const setLocalStorage = (key, object) => localStorage.setItem(key, JSON.stringify(object));