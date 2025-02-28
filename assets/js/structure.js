'use strict';

const FULL = 'FULL'

function nullIfEmpty(value){
  return value.trim() == "" ? null : value
}

class Structure {

  /**
   * Chargement de la structure
   */
  static load(sttName){
    ServerTalk.dial({
        route: "structure/load"
      , method: "POST"
      , data: {structure_path: "default"}
      , callback: this.afterLoad.bind(this) 
    })
  }
  static afterLoad(retour){
    if (retour.ok) {
      this.current = new Structure(retour.structure)
      this.current.build()
    } else {
      Flash.error(retour.error)
    }
  }

  /**
   * Sauvegarde de la structure
   */
  static save(){
    this.current.getData()
    if ( this.current.notSavable() ) return ;
    ServerTalk.dial({
        route: "/structure/save"
      , data:  {structure: this.current.data}
      , callback: this.afterSave.bind(this)
    })
  }
  static afterSave(retour){
    if (retour.ok) {
      Flash.notice("Structure sauvegardée.")
    } else {
      Flash.error(retour.error)
    }
  }

  static reset(){
    if (confirm("Veux-tu vraiment tout efface ?")){
      this.cadre.innerHTML = ""
      this.current = new Structure(this.defaultDataStructure)
    }
  }

  static get defaultDataStructure(){
    return {
        elements: []
      , metadata: {path: ''}
      , preferences: {display: 'paysage'}
    }
  }

  static get cadre(){return this._cadre || (this._cadre = DGet('div#structure'))}
  static masquer_cadre(){this.setCadreVisi(false)}
  static display_cadre(){setTimeout(this.setCadreVisi.bind(this, true), 100)}
  static setCadreVisi(visible){this.cadre.style.visibility = visible ? "visible" : "hidden"}

  /**
   * Fonction qui retourne true si le pitch +pitch+ existe déjà
   */
  static pitchExists(pitch){
    for(var elt of this.current.elements) {
      if ( elt.pitch == pitch ) return true
    }
    return false
  }

  // =========  I N S T A N C E   S T R U C T U R E  =============

  constructor(data){
    this.data = data
    this.elements = []; // pour liste des instances d'élément
    this.table    = {};
    this.applyMetadata();
    this.applyPreferences();
  }
  get metadata(){return this.data.metadata}
  get data_elements(){return this.data.elements}
  get preferences(){return this.data.preferences}

  applyMetadata(){
    DGet("input#structure-name").value = this.metadata.path
  }
  applyPreferences(){
    console.info("Je dois apprendre à appliquer les préférences")
  }

  /**
   * Fonction qui retourne false si la structure n'est pas sauvable
   */
  notSavable(){
    try {
      this.metadata.path || raise("Il faut fournir un path pour cette structure", DGet('input#structure-name'))

      return false ; // donc sauvable
    } catch(erreur) {
      Flash.error(erreur.message)
      return true
    }
  }
  /**
   * Fonction qui retourne les données de la structure (en premier 
   * lieu pour l'enregistrer)
   */
  getData(){
    this.metadata.path = DGet('input#structure-name').value
    this.data = {
        metadata: this.metadata
      , preferences: this.preferences
      , elements: this.elements.map(elt => {return elt.data})
    }
    return this.data
  }
  /**
   * CONSTRUCTION DE LA STRUCTURE
   * ----------------------------
   * Fonction principale qui construit la structure définie
   */
  build(){
    Structure.masquer_cadre()
    this.data.elements.forEach( delement => {
      if ( !delement.id ) { delement.id = SttElement.getNewId(delement.type)}
      const elt = new SttElement(delement)
      this.elements.push(elt)
      Object.assign(this.table, {[elt.id]: elt})
      elt.build()
    })
    Structure.display_cadre()
  }

  /**
   * Fonction retournant l'élément d'identifiant +id+
   */
  getElement(id){
    return this.table[id]
  }
  /**
   * Fonction appelée pour ajouter l'élément
   */
  addElement(element){
    this.elements.push(element)
  }
}


window.Structure  = Structure;
