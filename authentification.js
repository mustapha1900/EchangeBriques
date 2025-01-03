import { compare } from "bcrypt";
import Passport from "passport";
import { Strategy } from "passport-local";
import { getUtilisateurbyId, getUtilisateurbyCourriel } from "./model/utilisateur.js";
import passport from "passport";

const config = {
    usernameField: 'courriel',
    passwordField: 'mot_de_passe'
}

passport.use(new Strategy(config, async (courriel, mot_de_passe, done) => {
    try {
        const utilisateur = await getUtilisateurbyCourriel(courriel);

        if (!utilisateur) {
            return done(null, false, { erreur: 'mauvais_courriel' });
        }

        const valide = await compare(mot_de_passe, utilisateur.mot_de_passe);
        if (!valide) {
            return done(null, false, { erreur: 'mauvais_mot_de_passe' });
        }

        return done(null, utilisateur);
    }
    catch (erreur) {

        return done(erreur);
    }

}));

passport.serializeUser((utilisateur, done) => {                // ce qu on veut stocker dans la base de donnes de session
    done(null, utilisateur.id_utilisateur);
});

passport.deserializeUser(async (id_utilisateur, done) => {
    try {
        const utilisateur = await getUtilisateurbyId(id_utilisateur);
        done(null, utilisateur);
    }
    catch (erreur) {
        done(erreur);
    }
})