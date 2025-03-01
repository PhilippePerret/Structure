# réflexions

## Nouvelle façon de faire

En fait, ne plus avoir la structure horizontale d'un côté (avec ses propres instances SttElement) et de l'autre la feuille des éléments.

C'est LA MÊME ENTITÉ selon des PRÉSENTATIONS différentes et des "privilèges" différents. On a ces trois représentations :

* structure horizontale (disposition 'paysage' par défaut)
* structure verticale (disposition 'portrait')
* listing d'édition

Question : faut-il adopter une seule méta-classe (Structure) avec des classes filles qui contiennent d'autres choses ? La class Structure peut-elle être la métastructure ?

Question : faut-il supprimer définitivement le formulaire d'édition ?
Réponse : oui, ou pas sûr… Si on est sur la structure horizontale ou verticale, il peut être plus pratique d'éditer l'élément avec ce formulaire => le placer à la souris.