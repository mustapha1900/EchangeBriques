
const formulaire = document.getElementById('form-echange');
const nomEchange = document.getElementById('nom-echange');
const erreurNomEchange = document.getElementById('erreur-nom-echange');

// Fonction pour soumettre un échange a notre API
async function soumettreEchange(event) {
    event.preventDefault();
    // On verifie la validite du formulaire principal
    if (!formulaire.checkValidity()) {
        erreurNomEchange.innerText = 'Veuillez remplir tous les champs requis du formulaire.';
        return;
    }
    const briques = [];
    const quantiteInputs = document.querySelectorAll('#brique-table input[type="number"]');
    let atLeastOneValid = false; // on verifie si au moins un champ est rempli avec une quantite > 0

    // Boucle pour verifier les quantites
    quantiteInputs.forEach(input => {
        const idBrique = input.getAttribute('data-id-brique');
        const quantite = parseInt(input.value, 10) || 0;

        if (quantite < 0) {
            erreurNomEchange.innerText = 'Veuillez insérer une quantité valide pour chaque brique.';
            return;
        }

        if (quantite > 0) {
            atLeastOneValid = true;
            briques.push({
                id_brique: parseInt(idBrique, 10),
                quantite: quantite
            });
        }
    });

    // Si aucune quantite n'est positive,on affiche une erreur et on arrete la soumission
    if (!atLeastOneValid) {
        erreurNomEchange.innerText = 'Veuillez remplir au moins un champ avec une quantité positive.';
        return;
    }

    // Structure des données à envoyer
    const data = {
        
        nom_echange: nomEchange.value,
        briques: briques
    };

    await fetch('/api/echanges', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    // Retour à la page Index
    window.location.href = '/';
}

// Fonction de validation pour le nom d'échange
function validateNomEchange() {
    if (nomEchange.validity.valid) {
        nomEchange.classList.remove('erreur');
        erreurNomEchange.innerText = '';
    } else {
        nomEchange.classList.add('erreur');
        
        if (nomEchange.validity.valueMissing) {
            erreurNomEchange.innerText = 'Le champ de nom d\'échange doit être rempli.';
        } else if (nomEchange.validity.tooShort) {
            erreurNomEchange.innerText = 'Le champ de nom d\'échange doit contenir au moins 5 caractères.';
        } else if (nomEchange.validity.tooLong) {
            erreurNomEchange.innerText = 'Le champ de nom d\'échange doit contenir au maximum 200 caractères.';
        }
    }
}
formulaire.addEventListener('submit', soumettreEchange);
nomEchange.addEventListener('input', validateNomEchange);

