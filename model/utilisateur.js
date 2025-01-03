import { hash } from 'bcrypt';
import { connexion } from '../db/db.js'
export async function getUtilisateurbyId(id_utilisateur) {
    const utilisateur = await connexion.get(
        'SELECT * FROM utilisateur WHERE id_utilisateur = ?',
        [id_utilisateur]
    );
    return utilisateur;
}

export async function getUtilisateurbyCourriel(courriel) {
    const utilisateur = await connexion.get(
        ' SELECT * FROM utilisateur WHERE courriel = ?',
        [courriel]
    );
    return utilisateur;
}

export async function addUtilisateur(courriel, mot_de_passe, nom, prenom) {
    const motdepasseHash = await hash(mot_de_passe, 10);
    const result = await connexion.run(
        `INSERT INTO utilisateur (courriel, mot_de_passe, nom ,prenom)
        VALUES (?,?,?,?); 
        `,
        [courriel, motdepasseHash, nom, prenom]
    );

    return result.lastID;
}
