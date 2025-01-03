import { existsSync } from 'fs'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const IS_NEW = !existsSync(process.env.DB_FILE);

async function createDatabase(connexion) {
    await connexion.exec(
        `CREATE TABLE couleur (
            id_couleur INTEGER PRIMARY KEY,
            nom TEXT NOT NULL
        );
        
        CREATE TABLE brique (
            id_brique INTEGER PRIMARY KEY,
            id_couleur INTEGER,
            id_design NOT NULL,
            nom TEXT NOT NULL,
            image TEXT NOT NULL,
            valeur REAL NOT NULL,
            FOREIGN KEY(id_couleur) REFERENCES couleur(id_couleur)
        );

        CREATE TABLE utilisateur (
            id_utilisateur INTEGER PRIMARY KEY,
            courriel TEXT UNIQUE NOT NULL,
            nom TEXT,
            prenom TEXT,
            mot_de_passe TEXT NOT NULL,
            acces INTEGER
        );
        
        CREATE TABLE echange (
            id_echange INTEGER PRIMARY KEY,
            id_utilisateur INTEGER NOT NULL,
            id_proposition_accepte INTEGER,
            nom_echange TEXT,
            FOREIGN KEY(id_utilisateur) REFERENCES utilisateur(id_utilisateur),
            FOREIGN KEY(id_proposition_accepte) REFERENCES proposition(id_proposition)
        );
        
         CREATE TABLE proposition (
            id_proposition INTEGER PRIMARY KEY,
            id_echange INTEGER NOT NULL,
            id_utilisateur INTEGER NOT NULL,
            FOREIGN KEY(id_echange) REFERENCES echange(id_echange),
            FOREIGN KEY(id_utilisateur) REFERENCES utilisateur(id_utilisateur)
        );
        
        CREATE TABLE echange_brique (
            id_echange INTEGER,
            id_brique INTEGER,
            quantite INTEGER NOT NULL,
            PRIMARY KEY(id_echange, id_brique), 
            FOREIGN KEY(id_echange) REFERENCES echange(id_echange),
            FOREIGN KEY(id_brique) REFERENCES brique(id_brique)
        );
        
        CREATE TABLE proposition_brique (
            id_proposition INTEGER,
            id_brique INTEGER,
            quantite INTEGER NOT NULL,
            PRIMARY KEY(id_proposition, id_brique), 
            FOREIGN KEY(id_proposition) REFERENCES proposition(id_proposition),
            FOREIGN KEY(id_brique) REFERENCES brique(id_brique)
        );
        
        INSERT INTO couleur (nom) VALUES
        ('rouge'),
        ('jaune'),
        ('bleu'),
        ('vert'),
        ('blanc'),
        ('noir');

        INSERT INTO brique (id_couleur, id_design, nom, image, valeur) VALUES
        (1, 3003, 'Brique 2X2 rouge', 'brique-2x2-rouge.jpg', 0.17),
        (2, 3003, 'Brique 2X2 jaune', 'brique-2x2-jaune.jpg', 0.17),
        (3, 3003, 'Brique 2X2 bleu', 'brique-2x2-bleu.jpg', 0.17),
        (4, 3003, 'Brique 2X2 vert', 'brique-2x2-vert.jpg', 0.17),
        (5, 3003, 'Brique 2X2 blanc', 'brique-2x2-blanc.jpg', 0.17),
        (6, 3003, 'Brique 2X2 noir', 'brique-2x2-noir.jpg', 0.17),
        (1, 3001, 'Brique 2X4 rouge', 'brique-2x4-rouge.jpg', 0.27),
        (2, 3001, 'Brique 2X4 jaune', 'brique-2x4-jaune.jpg', 0.27),
        (3, 3001, 'Brique 2X4 bleu', 'brique-2x4-bleu.jpg', 0.27),
        (4, 3001, 'Brique 2X4 vert', 'brique-2x4-vert.jpg', 0.27),
        (5, 3001, 'Brique 2X4 blanc', 'brique-2x4-blanc.jpg', 0.27),
        (6, 3001, 'Brique 2X4 noir', 'brique-2x4-noir.jpg', 0.27),
        (1, 3020, 'Plaque 2X4 rouge', 'plaque-2x4-rouge.jpg', 0.18),
        (2, 3020, 'Plaque 2X4 jaune', 'plaque-2x4-jaune.jpg', 0.18),
        (3, 3020, 'Plaque 2X4 bleu', 'plaque-2x4-bleu.jpg', 0.18),
        (4, 3020, 'Plaque 2X4 vert', 'plaque-2x4-vert.jpg', 0.18),
        (1, 2445, 'Plaque 2X12 rouge', 'plaque-2x12-rouge.jpg', 0.46),
        (6, 2445, 'Plaque 2X12 noir', 'plaque-2x12-noir.jpg', 0.46),
        (3, 2445, 'Plaque 2X12 bleu', 'plaque-2x12-bleu.jpg', 0.46),
        (4, 2445, 'Plaque 2X12 vert', 'plaque-2x12-vert.jpg', 0.46),
        (6, 3811, 'Plaque de base 32X32 noir', 'plaque-base-32x32-noir.jpg', 12.85),
        (3, 3068, 'Tuile 2X2 bleu', 'tuile-2x2-bleu.jpg', 0.1),
        (2, 6141, 'Plaque ronde 1X1 jaune', 'plaque-ronde-1x1-jaune.jpg', 0.06),
        (5, 3062, 'Brique ronde 1X1 blanc', 'brique-ronde-1x1-blanc.jpg', 0.08);
        
        INSERT INTO utilisateur (courriel, nom, prenom, mot_de_passe, acces)
        VALUES ('test@test.com', 'Christiansen', 'Ole Kirk', '$2b$10$WczNci6bnSjACD0m260FaOoVcjUaMmLTpzoytOjQ6tqqGOT.MyYau', 1);`
    );

    return connexion;
}

let connexion = await open({
    filename: process.env.DB_FILE,
    driver: sqlite3.Database
});

if(IS_NEW) {
    connexion = await createDatabase(connexion);
}

export { connexion };
