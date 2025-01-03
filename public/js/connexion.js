
const formulaireConnexion = document.getElementById('form-connexion')
const courrielUtilisateur = document.getElementById('courriel_connexion')
const motDePasseUtilisateur = document.getElementById('mot_de_passe_connexion')
const messageAuth = document.getElementById('message-connexion')

export async function connexion(event) {
    event.preventDefault();

    const data = {
        courriel : courrielUtilisateur.value,
        mot_de_passe: motDePasseUtilisateur.value  
    }

    const response = await fetch ('/api/connexion' , {
        method : 'POST',
        headers : {'Content-Type' : 'application/json'} ,
        body : JSON.stringify(data)
    });
    if (response.ok) {
        location.replace('/');
    } 
    else if (response.status === 401) {
        const message = await response.json();
        if(message.erreur === 'mauvais_courriel') {
            messageAuth.textContent = 'Un compte avec ce courriel n\'existe pas.';
        }
        else if (message.erreur === 'mauvais_mot_de_passe') {
            messageAuth.textContent = 'Mot de passe incorrect.';
        }
    }
    else if (response.status === 400) {
        messageAuth.textContent = 'Veuillez remplir tous les champs.';
    }
}

formulaireConnexion.addEventListener('submit', connexion);