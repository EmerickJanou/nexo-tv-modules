# NEXO TV — modules signés

Ce dépôt public distribue uniquement les modules signés et leur outil de vérification. Le code Android reste dans un dépôt privé. Aucune clé privée ou donnée de connexion ne doit être ajoutée ici.

La version 1 est un module vide de mise en service : elle ne modifie aucune association de créateurs.

Les modules sont signés hors GitHub, puis vérifiés avec la clé publique avant déploiement manuel par Actions. GitHub Pages publie uniquement le fichier creator-rules.signed.json.

Les mises à jour suivantes doivent augmenter la révision. Ne jamais modifier le payload ou la signature après signature.