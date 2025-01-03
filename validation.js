// Validation des ID
export const valideID = (id) =>
    typeof id === 'number' &&
    !Number.isNaN(id) &&
    Number.isFinite(id) &&
    id > 0;
// Validation des Textes 
export const validateTexte = (texte) =>
    typeof texte === 'string' &&
    texte &&
    texte.length >= 5 &&
    texte.length <= 200;

export const validateCourriel = (courriel) => 
    typeof courriel === 'string' &&
    courriel &&
    courriel.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);

export const validateMotdePasse = (mot_de_passe)=>
    typeof mot_de_passe === 'string' &&
mot_de_passe &&
mot_de_passe.length >= 4;
