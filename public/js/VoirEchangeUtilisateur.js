// Fonction pour attacher l'événement de suppression à chaque bouton "Supprimer"

function ajouterEvenementSupprimer(id_echange, tr) {
    const boutons = document.querySelectorAll('.bouton-supprimer');
    for (let bouton of boutons) {
        bouton.addEventListener('click', () => {
            const id_echange = bouton.getAttribute('data-id');// On recupere le ID echange 
            const tr = bouton.closest('tr');  // on selectionne le le TR associe au bouton
            supprimerEchange(id_echange, tr);// jappelle la fonction de suppression avec l'ID echange et le tr
        });
    }
}

// Fonction pour supprimer un échange spécifique côté serveur et dans le DOM
async function supprimerEchange(id_echange, tr) {
    const response = await fetch(`/api/supprimerEchange?id_echange=${id_echange}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        tr.remove();
    }
}
// Appel de la fonction pour attacher les événements de suppression aux boutons
ajouterEvenementSupprimer();