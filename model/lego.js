import { connexion } from "../db/db.js";

// Fonction pour récupérer tous les échanges de tous les utilisateurs avec la requete SQL
export async function GetTousLesEchanges() {
    const echanges = await connexion.all(`
    SELECT nom_echange, 
           nom AS nom_utilisateur,
           prenom AS prenom_utilisateur,  
          echange.id_utilisateur,
          echange.id_echange 
    FROM
    echange
    JOIN
        utilisateur ON echange.id_utilisateur = utilisateur.id_utilisateur
    ;`)
    return echanges;
}

// Fonction pour récupérer tous les échanges d'un utilisateur spécifique par son ID
export async function GetTousLesEchangesParIdUtilisateurs(id_utilisateur) {
    const echanges = await connexion.all(`
    SELECT 
           id_echange,
           nom_echange, 
           nom AS nom_utilisateur,
           prenom AS prenom_utilisateur  
    FROM
        echange
    JOIN
        utilisateur ON echange.id_utilisateur = utilisateur.id_utilisateur
    WHERE 
        echange.id_utilisateur = ?;`, [id_utilisateur]);

    return echanges;
}

// Fonction pour supprimer un échange spécifique par son ID
export async function SupprimerUnEchange(id_echange) {

    const echangeExiste = await connexion.get(
        `SELECT * FROM echange WHERE id_echange = ?;`,
        [id_echange]
        
    );
   // Si l'échange n'existe pas, retourner null
    if (!echangeExiste) {
        return false;
    }

    await connexion.run(
        `DELETE FROM echange_brique WHERE id_echange=?;
        ` , [id_echange]);

    await connexion.run(
        `DELETE FROM echange WHERE id_echange=?;
        `, [id_echange]);

    return true
  
};

// Fonction pour soumettre un nouvel échange avec ses briques associées
export async function soumettreEchange(nom_echange, briques, id_utilisateur) {
    const result = await connexion.run(
        'INSERT INTO echange (nom_echange, id_utilisateur) VALUES (?, ?)',
        [nom_echange, id_utilisateur]
    );
   
    const id_echange = result.lastID;

    for (const brique of briques) {
        await connexion.run(
            'INSERT INTO echange_brique (id_echange, id_brique, quantite) VALUES (?, ?, ?)',
            [id_echange, brique.id_brique, brique.quantite]
        );
    }
    return id_echange;
}
// Fonction pour récupérer les informations détaillées d'un échange spécifique par son ID
export async function getEchangeAvecBriquesById(id_echange) {
    const echange = await connexion.all(`SELECT 
            e.id_utilisateur,
            e.nom_echange AS nom_echange,
            u.nom AS nom_utilisateur,
            u.prenom AS prenom_utilisateur,
            b.nom AS nom_brique,
            b.valeur AS valeur,
            b.image AS image,
            eb.quantite AS quantite_brique,
            e.id_echange
        FROM 
            echange e
        JOIN 
            utilisateur u ON e.id_utilisateur = u.id_utilisateur
        JOIN 
            echange_brique eb ON e.id_echange = eb.id_echange
        JOIN 
            brique b ON eb.id_brique = b.id_brique
        WHERE 
            e.id_echange = ?`
        , [id_echange]);
    return echange;
}

export async function getEchangeById (id_echange) {
    const echange = await connexion.get(`
        SELECT * FROM echange 
        WHERE echange.id_echange = ?` , [id_echange]);
}
// Fonction pour récupérer toutes les briques disponibles
export async function getBriques() {
    const briques = await connexion.all('SELECT * FROM brique');
    return briques;
}
// Fonction pour calculer le prix total d'un échange spécifique en fonction des briques et de leurs quantités
export async function getEchangePrix(id_echange) {
    const prix = await connexion.get(
        `SELECT SUM(brique.valeur * echange_brique.quantite) AS total
        FROM echange_brique
        JOIN brique ON echange_brique.id_brique = brique.id_brique
        WHERE echange_brique.id_echange = ?`,
        [id_echange]
    );

    return prix.total;
}

// Fonction pour soumettre une proposition
export async function soumettreProposition(id_echange, briques, id_utilisateur) {
    // Insérer dans la table proposition
    const result = await connexion.run(
        'INSERT INTO proposition (id_echange , id_utilisateur) VALUES (? , ?)',
        [id_echange , id_utilisateur]
    );
    const id_proposition = result.lastID;

    // Insérer chaque brique associée dans la table proposition_brique
    for (const brique of briques) {
        await connexion.run(
            'INSERT INTO proposition_brique (id_proposition, id_brique, quantite) VALUES (?, ?, ?)',
            [id_proposition, brique.id_brique, brique.quantite]
        );
    }

    return id_proposition;
}

export async function getPropositionsByEchangeId(id_echange) {
    const propositions = await connexion.all(`
        SELECT 
            p.id_proposition,
            p.id_echange,
            u.nom AS nom_utilisateur,
            u.prenom AS prenom_utilisateur
        FROM 
            proposition p
        JOIN 
            utilisateur u ON p.id_utilisateur = u.id_utilisateur
        WHERE 
            p.id_echange = ?;
    `, [id_echange]);

    return propositions;
}

export async function getPropositionById(id_proposition) {
    const proposition = await connexion.all(
        `
        SELECT 
            p.id_proposition,
            p.id_echange,
            p.id_utilisateur,
            pb.id_brique,
            pb.quantite
        FROM 
            proposition AS p
        JOIN 
            proposition_brique AS pb
        ON 
            p.id_proposition = pb.id_proposition
        WHERE 
            p.id_proposition = ?
        `,
        [id_proposition]
    );
    
    return proposition;
}

export async function getPropositionPrix(id_proposition) {
    const prix = await connexion.get(
        `
        SELECT 
            SUM(b.valeur * pb.quantite) AS total
        FROM 
            proposition_brique AS pb
        JOIN 
            brique AS b
        ON 
            pb.id_brique = b.id_brique
        WHERE 
            pb.id_proposition = ?
        `,
        [id_proposition]
    );

    return prix.total;
};

export async function getUtilisateurById(id_echange){
    const utilisateurCreateurEchange = await connexion.get(
        `
        SELECT 
            utilisateur.nom, utilisateur.prenom, echange.nom_echange, utilisateur.id_utilisateur
        FROM 
            utilisateur
        JOIN 
            echange 
        ON 
            utilisateur.id_utilisateur = echange.id_utilisateur
        WHERE 
            echange.id_echange = ?
        `,
        [id_echange]
    );

    return utilisateurCreateurEchange;
}

export async function getPropositionAvecBriqueById(id_proposition){
    const propositionDetails = await connexion.all (`
        SELECT 
             p.id_proposition,
             pb.id_brique,
             pb.quantite,
             b.nom AS nom_brique,
             b.image AS image_brique,
             b.valeur AS valeur_brique,
             u.nom AS nom_utilisateur,
             u.prenom AS prenom_utilisateur
        FROM
             proposition p
        JOIN 
             proposition_brique pb ON p.id_proposition = pb.id_proposition
        JOIN 
            brique b ON  pb.id_brique = b.id_brique
        JOIN
            utilisateur u ON p.id_utilisateur = u.id_utilisateur
        WHERE
            p.id_proposition = ?
        `, [id_proposition]);
        return propositionDetails;
}
