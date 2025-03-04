'use strict';


class Structure {

  static reset(){
    if (confirm("Veux-tu vraiment tout effacer ?")){
      this.eraseElements()
      this.current = new Structure(this.defaultDataStructure)
      ListElement.reset()
    }
  }

  static get defaultDataStructure(){
    return {
        elements: []
      , metadata: {path: ''}
      , preferences: {}
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
  get path(){return this.data.metadata.path} // raccourci
  get metadata(){return this.data.metadata}
  get data_elements(){return this.data.elements}
  get preferences(){return this.data.preferences}

  save(){Structure.save()}

  resetWithElements(dataElements){
    this.data.elements = dataElements
    this.elements = []
    this.table    = {}
    Structure.eraseElements()
    this.build()
  }


  applyMetadata(){
    DGet("input#structure-name").value = this.metadata.name
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


}


window.Structure  = Structure;
