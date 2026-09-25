# NEXO TV — modules signés

Ce dépôt public distribue uniquement les modules signés et leur outil de vérification. Le code Android reste dans un dépôt privé. Aucune clé privée ou donnée de connexion ne doit être ajoutée ici.

La version 1 est un module vide de mise en service : elle ne modifie aucune association de créateurs.

Les modules sont signés hors GitHub, puis vérifiés avec la clé publique avant déploiement manuel par Actions. GitHub Pages publie uniquement le fichier creator-rules.signed.json.

Adresse à saisir dans NEXO TV, Paramètres → Modules de règles et restauration :

https://emerickjanou.github.io/nexo-tv-modules/creator-rules.signed.json

La publication et le téléchargement dans l’application ont été validés le 25 septembre 2026 avec la révision 1. Le site n’a pas de page d’accueil ; utiliser l’adresse complète du fichier. Les mises à jour sont manuelles.

Les mises à jour suivantes doivent augmenter la révision. Ne jamais modifier le payload ou la signature après signature.
