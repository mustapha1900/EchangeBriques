const formulaireProposition = document.getElementById('form-proposition');
const id_echange = formulaireProposition.getAttribute('data-id-echange');
const id_utilisateur = formulaireProposition.getAttribute('data-id-utilisateur');
const erreur_quantite = document.getElementById('erreur-quantite-proposition');

console.log(id_echange);

async function soumettrePropositionClient(event) {
    event.preventDefault();

    if (!formulaireProposition.checkValidity()) {
        erreur_quantite.innerText = 'Veuillez remplir une quantité pour au moins une brique.';
        return;
    }

    const briques = [];
    const quantiteInputs = document.querySelectorAll('#brique-table input[type="number"]');
    let atLeastOneValid = false;

    quantiteInputs.forEach(input => {
        const idBrique = input.getAttribute('data-id-brique');
        const quantite = parseInt(input.value, 10) || 0;

        if (quantite < 0) {
            erreur_quantite.innerText = 'La quantité ne peut pas être négative.';
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
    if (!atLeastOneValid) {
        erreur_quantite.innerText = 'Veuillez remplir au moins un champ avec une quantité positive.';
        return;
    }
 
    const data = {
        id_echange: id_echange, 
        briques : briques,
        id_utilisateur: id_utilisateur     
    };
   
    await fetch('/api/propositions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    window.location.href = '/'; // Redirection après soumission
}

formulaireProposition.addEventListener('submit', soumettrePropositionClient);