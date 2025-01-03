// Import des modules et des dépendances
import 'dotenv/config'
import https from 'node:https'
import { readFile } from 'node:fs/promises'
import express, { json, request, response } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import { connexion } from './db/db.js'
import { soumettreEchange, getEchangePrix, GetTousLesEchanges, GetTousLesEchangesParIdUtilisateurs, getBriques, SupprimerUnEchange, getEchangeAvecBriquesById, soumettreProposition, getPropositionsByEchangeId, getEchangeById, getPropositionById, getPropositionPrix, getUtilisateurById, getPropositionAvecBriqueById } from './model/lego.js'
import { valideID, validateTexte, validateCourriel, validateMotdePasse } from './validation.js'
import { engine } from 'express-handlebars';
// import UA3
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';
import './authentification.js';
import { addUtilisateur } from './model/utilisateur.js'

// creation du serveur

const app = express();

//creation de la base de donnnees de session //UA3
const MemoryStore = memorystore(session);

//Ajout des engins des template Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');


// Middleware

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(json());
//configuration de la base de donne de  // ajout UA3
app.use(session({
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static('public'));

// Création de middlewares
function utilisateurConnecte(request, response, next) {
    if (!request.user) {
        response.status(401).end();
        return;
    }
    next();
}


//HandleBars Routes
// 1 / Route de la page Index (page d'acceuil)
app.get('/', async (request, response) => {
    const TousLesEchanges = await GetTousLesEchanges()

    response.render('index', {
        titre: 'Page d\'accueil',
        styles: ['/css/index.css'],
        scripts: ['/js/deconnexion.js'],
        TousLesEchanges: TousLesEchanges,
        utilisateurConnecte: request.user
    });
})

//2 / Route de la page 'Profil' (tous les echanges d'un utilisateur)
app.get('/VoirEchangeUtilisateur', utilisateurConnecte, async (request, response) => {

    const idUtilisateur = request.user.id_utilisateur;

    const EchangesUtilisateur = await GetTousLesEchangesParIdUtilisateurs(idUtilisateur);
    response.render('VoirEchangeUtilisateur', {
        titre: 'Voir Les Echanges de l\'Utilisateur',
        styles: ['/css/VoirEchangeUtilisateur.css'],
        scripts: ['/js/VoirEchangeUtilisateur.js', '/js/deconnexion.js'],
        SesEchanges: EchangesUtilisateur,
        utilisateurConnecte: request.user
    });
})

//3 / Route pour afficher page creer Echange
app.get('/CreerEchange', utilisateurConnecte, async (req, res) => {

    const briques = await getBriques();
    res.render('CreerEchange', {
        titre: 'Créer un Échange',
        styles: ['/css/creerEchange.css'],
        scripts: ['/js/CreerEchange.js', '/js/deconnexion.js'],
        briques: briques,
        utilisateurConnecte: req.user
    });
});

//4 / Route de la page Afficher un Echange specifique
app.get('/afficherEchangeSpecifique', async (req, res) => {


    const id_echange = req.query.id_echange;
    if (valideID(Number(id_echange))) {
        const echange = await getEchangeAvecBriquesById(id_echange);

        if (echange.length > 0) {

            const valeurEchange = await getEchangePrix(id_echange);
            const valeurArrondie = Math.round(valeurEchange * 100) / 100;
            const { nom_utilisateur, prenom_utilisateur } = echange[0];
            const utilisateurConnecte = req.user;
            const estCreateur = utilisateurConnecte && echange[0].id_utilisateur === utilisateurConnecte.id_utilisateur;
            const nestPasCreateur = !estCreateur;
            const afficherBoutonProposer = utilisateurConnecte && nestPasCreateur;

            let propositions = await getPropositionsByEchangeId(id_echange);

            res.render('afficherEchangeSpecifique', {
                titre: 'Afficher un Echange Spécifique',
                styles: ['/css/index.css', '/css/afficherEchangeSpecifique.css'],
                scripts: ['/js/deconnexion.js'],
                id_echange: id_echange,
                echange: echange,
                valeurEchange: valeurArrondie,
                nom_utilisateur: nom_utilisateur,
                prenom_utilisateur: prenom_utilisateur,
                utilisateurConnecte: req.user,
                afficherBoutonProposer: afficherBoutonProposer,
                proposition: propositions,
                estCreateur: estCreateur,
                nEstPasCreateur: nestPasCreateur
            });
        } else {
            res.status(404).end();
        }
    } else {
        res.status(400).end();
    }

});


//5 Route API pour supprimer un échange spécifique
app.delete('/api/supprimerEchange', utilisateurConnecte, async (request, response) => {
    //validation de L'ID
    const idUser = request.user.id_utilisateur
    const parsedIdEchange = parseInt(request.query.id_echange)
    if (valideID(parsedIdEchange)) {
        const echange = await getEchangeById(parsedIdEchange)
        if (echange) {
            if (echange.id_utilisateur !== idUser) {
                response.status(403).end();
            }
        }
        const isSppressionSuccesResult = await SupprimerUnEchange(request.query.id_echange);
        if (isSppressionSuccesResult === true) {
            response.status(200).end();
        }
        else {
            response.status(404).end();
        }
    }
    else {
        response.status(400).end();
    }
});
//6 Route pour Creer un echange et le soumettre
app.post('/api/echanges', async (req, res) => {
    if (req.user) {
        const { nom_echange, briques } = req.body;
        const { id_utilisateur } = req.user;

        if (validateTexte(nom_echange)) {
            if (briques.length > 0) {
                for (let i = 0; i < briques.length; i++) {
                    if (briques[i].quantite > 0) {
                        const id_echange = await soumettreEchange(nom_echange, briques, id_utilisateur);
                        const total = await getEchangePrix(id_echange);
                        res.status(201).json({ id_echange, total });
                        return
                    } else {
                        res.status(400).end();
                        return;
                    }
                }
            } else {
                res.status(400).end();
            }
        } else {
            res.status(400).end();
        }
    } else {
        res.status(401).end();
    }
});


//7 Route API pour récupérer un échange spécifique par ID
app.get('/api/echange', async (req, res) => {
    if (valideID(parseInt(req.query.id_echange))) {

        const echange = await getEchangeAvecBriquesById(req.query.id_echange);
        if (echange.length > 0) {

            res.status(200).json(echange);
        }
        else {
            res.status(404).end();
        }
    } else {
        res.status(400).end();
    }
});

//8 Route API pour récupérer toutes les briques
app.get('/api/briques', async (req, res) => {
    const briques = await getBriques();
    res.status(200).json(briques);
});
//9 Route API pour Creer une proposition
app.post('/api/propositions', async (req, res) => {

    const { id_echange, briques, id_utilisateur_createur } = req.body;
    const id_utilisateurConnecter = req.user.id_utilisateur;
    const estCreateur = id_utilisateur_createur === id_utilisateurConnecter;
    const echange = await getEchangeAvecBriquesById(req.body.id_echange)

    if (!valideID(Number(id_echange))) {
        res.status(400).end();
    }

    if (req.user) { 

        if (estCreateur || echange.length === 0) {
            res.status(403).end();
        }
        else {
            if (briques && briques.length === 0) {
                res.status(400).end();
            }
            else {

                await soumettreProposition(id_echange, briques, id_utilisateurConnecter);
                res.status(201).end();
            }
        }

    }
    else {
        res.status(401).end();
    }

});


//10 route pour Ajouter un utilisateur

app.post('/api/user', async (request, response) => {
    if (request.user) {
        response.status(400).end();
        return;
    }

    if (validateCourriel(request.body.courriel) && validateMotdePasse(request.body.mot_de_passe)) {
        try {
            await addUtilisateur(
                request.body.courriel,
                request.body.mot_de_passe,
                request.body.nom,
                request.body.prenom
            );
            response.status(201).end();
        }
        catch (erreur) {
            if (erreur.code === 'SQLITE_CONSTRAINT') {
                response.status(409).end();
            }
            else {
                next(erreur);
            }
        }
    }
    else {
        response.status(400).end();
    }
});

//11 Route API pour Se connecter
app.post('/api/connexion', (req, res, next) => {

    if (req.user) {
        res.status(403).end();

        return;
    }
    if (validateCourriel(req.body.courriel) &&
        validateMotdePasse(req.body.mot_de_passe)) {
        passport.authenticate('local', (erreur, utilisateur, info) => {
            if (erreur) {
                next(erreur);
            }
            else if (!utilisateur) {
                res.status(401).json(info);
            }
            else {
                req.logIn(utilisateur, (erreur) => {
                    if (erreur) {
                        next(erreur);
                    }
                    res.status(200).end();
                });
            }
        })(req, res, next);
    }
    else {
        res.status(400).end();
    }
});

//12 Route API pour se Deconnecter
app.post('/api/deconnexion', (request, response, next) => {
    request.logOut((erreur) => {
        if (erreur) {
            next(erreur);
        }
        response.redirect('/');
    })
});

//13 Route pour afficher la page Inscription
app.get('/inscription', async (request, response) => {
    if (request.user) {
        response.redirect('/');
        return;
    }
    response.render('inscription', {
        titre: 'inscription',
        styles: ['/css/index.css', '/css/inscription.css'],
        scripts: ['/js/inscription.js'],
        utilisateurConnecte: request.user
    })
});

//14 Route Pour Afficher la page Connexion
app.get('/connexion', async (request, response) => {
    if (request.user) {
        response.redirect('/');
        return;
    }
    response.render('connexion', {
        titre: ' Page Connexion',
        styles: ['/css/index.css', '/css/connexion.css'],
        scripts: ['/js/connexion.js'],
        utilisateurConnecte: request.user
    })
});

//15 Route pour afficher la page de creation d'une proposition
app.get('/proposer-echange', utilisateurConnecte, async (req, res) => {
    
    const id_echange = req.query.id_echange;
    if (valideID(Number(id_echange))) {
        const echange = await getEchangeAvecBriquesById(id_echange)
        if (echange && echange.length > 0) {
            const id_createur_echange = echange[0].id_utilisateur
            // Récupérer toutes les briques disponibles
            const briques = await getBriques();
            if (id_createur_echange === req.user.id_utilisateur) {
                res.status(403).end()
                return;
            }          
            res.render('proposition', {
                titre: 'Faire une proposition',
                styles: ['/css/creerEchange.css'],
                scripts: ['/js/creerProposition.js', '/js/deconnexion.js'],
                id_echange: id_echange,
                briques: briques,
                id_utilisateur: id_createur_echange,
                utilisateurConnecte: req.user
            });
        } else {
            res.status(404).end()
        }
    } else {
        res.status(400).end()
    }
});

//16 Route pour voir une proposition specifique
app.get('/voir-proposition', utilisateurConnecte, async (req, res) => {

    const id_proposition = req.query.id_proposition;
    if (valideID(Number(id_proposition))) {
        const proposition = await getPropositionById(id_proposition);

        if (proposition && proposition.length > 0) {

            const valeurProposition = await getPropositionPrix(id_proposition);
            const valeurArrondie = Math.round(valeurProposition * 100) / 100;
            const id_echange = proposition[0].id_echange;
            const createurEchange = await getUtilisateurById(id_echange);
            const nom_echange = createurEchange.nom_echange;
            const propositionDetails = await getPropositionAvecBriqueById(id_proposition);
            const nomProposeur = propositionDetails[0].nom_utilisateur
            const prenomProposeur = propositionDetails[0].prenom_utilisateur
            if (req.user.id_utilisateur !== createurEchange.id_utilisateur) {
                res.status(403).end();
                return;
            }

            res.render('afficherPropositionSpecifique', {
                titre: 'voir proposition',
                styles: ['css/index.css', 'css/afficherPropositionSpecifique.css'],
                scripts: ['/js/deconnexion.js'],
                proposition: proposition,
                valeurProposition: valeurArrondie,
                nomProposeur: nomProposeur,
                prenomProposeur: prenomProposeur,
                nom_echange: nom_echange,
                propositionBriques: propositionDetails,
                utilisateurConnecte: req.user
            });
        } else {
            res.status(404).end();
        }
    }
    else {
        res.status(400).end();
    }
});


// Lancement du serveur avec Securite en mode HTTPS
if (process.env.NODE_ENV === 'production') {
    console.info('Mon serveur vient de démarrer');
    console.info('http://localhost:' + process.env.PORT);
    app.listen(process.env.PORT);

}
else {
    const credentials = {
        cert: await readFile('./security/localhost.cert'),
        key: await readFile('./security/localhost.key')
    };
    console.info('Mon serveur vient de démarrer');
    console.info('https://localhost:' + process.env.PORT);
    https.createServer(credentials, app).listen(process.env.PORT);
}