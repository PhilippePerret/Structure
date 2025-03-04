'use strict';
/**
 * Gestion des filtres d'éléments en fonction des paramètres choisis.
 * 
 * Chaque type de structure a son propre filtre (on peut demander à 
 * ce qu'ils soient synchronisés)
 */

class EFilter {

  constructor(){

    this.prepare()
  }

  /**
   * Méthode principale pour appliquer le filtre à la liste qui lui
   * est associée. Appelé par le bouton "Filtrer" ou à tout 
   * changement peut-être
   */
  apply(){
    console.info("Je dois apprendre à appliquer le filtre.")
  }

  show(){this.obj.classList.remove('hidden')}
  hide(){this.obj.classList.add('hidden')}

  prepare(){
    console.info("Je dois apprendre à préparer les filtres")
    this.prepared = true
  }

  build(){
    const o = this.constructor.PANEL_CLONE.cloneNode(true)

    this.observe()
    return o ; // pour _obj
  }
  observe(){}

  /**
   * Pour synchronizer les filtres
   */
  synchronize(){
    console.info("Je dois apprendre à synchroniser les filtres.")
  }

  get obj(){return this._obj || (this._obj = this.build())}

}
window.EFilter = EFilter