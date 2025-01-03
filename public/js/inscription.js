
const nomUtilisateur = document.getElementById('nom_utilisateur');
const prenomUtilisateur = document.getElementById('prenom_utilisateur');
const courrielUtilisateur = document.getElementById('courriel');
const motDePasseUtilisateur = document.getElementById('mot_de_passe');
const confirmationMotDePasseUtilisateur = document.getElementById('confirmation_mot_de_passe');
const boutonConnexion = document.getElementById('bouton_inscription')
const formulaireInscription = document.getElementById('form-inscription');
const erreurInscription = document.getElementById('erreur-inscription');

export  async function inscription(event) {
    event.preventDefault();
    //Pour s'assurrer que tous les champs sont remplis par le user
    
    if (!nomUtilisateur.value) {
        erreurInscription.innerText = 'Veuillez entrer votre nom.';
        return;
    }
    if (!prenomUtilisateur.value) {
        erreurInscription.innerText = 'Veuillez entrer votre prenom.';
        return;
    }
    if (!courrielUtilisateur.value) {
        erreurInscription.innerText = 'Veuillez entrer votre adresse courriel.';
        return;
    }
    if (!motDePasseUtilisateur.value) {
        erreurInscription.innerText = 'Veuillez entrer votre mot de passe.';
        return;
    }
    if (!confirmationMotDePasseUtilisateur.value) {
        erreurInscription.innerText = 'Veuillez confirmer votre mot de passe.';
        return;
    }
    if (motDePasseUtilisateur.value !== confirmationMotDePasseUtilisateur.value) {
        erreurInscription.innerText = 'Les mots de passe ne correspondent pas.';
        return;
    }
   
    const data = {
        courriel : courrielUtilisateur.value,
        mot_de_passe : motDePasseUtilisateur.value,
        nom : nomUtilisateur.value,
        prenom : prenomUtilisateur.value
    }
   

    const response = await fetch ('/api/user', {
        method : 'POST',
        headers : {'Content-Type' :'application/json'},
        body : JSON.stringify(data)
    });

    if (response.ok) {
        location.href = '/connexion';
    }
    else if (response.status === 409) {
        erreurInscription.innerText = 'Un compte avec cette adresse courriel esxiste deja.';
    }
}

formulaireInscription.addEventListener('submit', inscription);