'use strict';

window.FULL = 'FULL'

class Structure {

  static get fieldStructureName(){ return DGet('input#structure-name') }
  /**
   * Chargement de la structure
   */
  static afterLoad(retour){
    if (retour.ok) {
      this.initialize()
      this.current = new Structure(retour.structure)
      this.current.build()

      ListElement.toggle()

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
    if (confirm("Veux-tu vraiment tout effacer ?")){
      this.eraseElements()
      this.current = new Structure(this.defaultDataStructure)
      ListElement.reset()
    }
  }

  static initialize(){
    this.eraseElements()
    this.current = null
  }

  static eraseElements(){
    this.blocElements.innerHTML = ""
  }
  
  static get defaultDataStructure(){
    return {
      elements: []
      , metadata: {path: ''}
      , preferences: {display: 'paysage'}
    }
  }
  
  static get cadre(){return this._cadre || (this._cadre = DGet('div#structure'))}
  static get blocElements(){return this._blocelts || (this.blocelts = DGet('div#structure div#structure-elements'))}
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
