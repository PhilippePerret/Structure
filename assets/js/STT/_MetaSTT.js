'use strict';

class MetaSTT {

  /**
   * La Méta-Structure courante
   */
  static get current(){return this._current}
  static set current(stt){return this._current = stt}
  
  static get fieldName(){return this._namefield || (this._namefield = DGet('input#structure-name'))}
  static get fieldPath(){return this._pathfield || (this._pathfield = DGet('input#structure-path'))}
  
  /**
   * Appelée par le bouton général "Enregistrer"
   */
  static saveCurrent(){this.current.save()}

  /**
   * Initialisation de la méta-structure
   * (appelée à l'ouverture de l'application)
   */
  static init(){
    const relPath = NullIfEmpty(this.fieldPath.value)
    if ( relPath ) {
      this.current = new MetaSTT(relPath);
      this.current.load()
    } else {
      console.info("Aucun nom de structure. Je ne charge rien.")
    }
  }

  /**
   * Pour tout ressetter par exemple avant le chargement d'une autre
   * structure ou la création d'une nouvelle.
   */
  static reset(){
    // Les champs à valeur
    ;[
      this.fieldName, this.fieldPath
    ].forEach(field => {field.value = ""})
  }

  static eraseListing(){this.listing.innerHTML = ""}

  /**
   * Le listing de chaque type de structure
   */
  static get listing(){
    return this._listing || (this._listing = DGet(`#stt-${this.classname}-listing`))
  }
  static get obj(){
    return this._obj || (this._obj = DGet(`div#stt-${this.classname}`))
  }

  /**
   * Le nom de chaque type de structure (pour les noms d'éléments)
   * Par exemple : 'verticalstt', 'editingstt' etc.
   */
  static get classname(){
    return this._classname || (this._classname = this.name.toLowerCase())
  }


  // ======== I N S T A N C E ==========

  constructor(relPath){
    this.relPath = relPath
  }

  setModified(modified = true){
    UI.setModified(modified)
    this.modified = !!modified
  }

  // Surclassée par classes filles
  prepare(){}

  /**
   * Chargement de la méta-structure courante
   */
  load(){
    ServerTalk.dial({
        route: "structure/load"
      , method: "POST"
      , data: {structure_path: this.relPath}
      , callback: this.afterLoad.bind(this) 
    })
  }
  afterLoad(retour){
    if (false == retour.ok) return Flash.error(retour.error);
    this.data = retour.structure
    // On reset tous les panneaux de structure
    this.constructor.reset()
    // Réglage de l'interface
    this.setInterface()
    // Dispatch des éléments de la structure
    this.table_elements = {}
    this.elements = this.data.elements.map(data_element => {
      const sttE = new MetaSTTElement(data_element)
      Object.assign(this.table_elements, {[sttE.id]: sttE})
      return sttE
    })
    console.info("Table des éléments", this.table_elements)
    // On ne construit que la structure à afficher
    this.activerStructure(this.data.preferences.disposition || 'Horizontal')
    this.setModified(false)
    // Application des préférences
    Preferences.apply(this, this.data.preferences)
  }

  /**
   * Pour enregistrer la méta-structure
   */
  save(callback){
    console.log("-> save (MetaSTT)")
    if ( false === this.getData() ) return ;
    ServerTalk.dial({
        route: "/structure/save"
      , data:  {structure: this.data}
      , callback: this.afterSave.bind(this, callback)
    })
  }
  afterSave(callback, retour){
    console.log("-> afterSave (MetaSTT)", callback, retour)
    if (retour.ok) { 
      this.setModified(false)
      callback() 
    } else return raise(retour.error);
  }

  /**
   * Pour tout réinitialiser
   * 
   * C'est nécessaire par exemple quand on vient de procéder à  l'enregistrement de nouveaux éléments.
   * 
   */
  resetAll(){
    console.log("Je dois apprendre à tout initialiser.")
  }

  /**
   * Fonction qui active (affiche) la disposition de structure de nom
   * +disposition+
   * 
   * @param {String} disposition 'Horizontal', 'Vertical' ou 'Editing'. Permet de reconstituer le nom de la classe à invoquer.
   */
  activerStructure(disposition){
    console.info("-> Activer structure '%s'", disposition)
    console.info("Structure actuelle", this.current_dispo)
    if ( this.current_dispo == 'Editing' && this.modified ) {
      console.info("La structure a été modifiée, je dois l'enregistrer avant de passer à une vision différente.")
      this.dispositions.Editing.saveAndContinue(this.activerStructure.bind(this))
      return
    }
    Object.keys(this.dispositions).forEach(keyDispo => {
      const dispo = this.dispositions[keyDispo]
      if ( disposition == keyDispo ) {
        // console.log("-> Activer structure", keyDispo)
        dispo.show()
      } else {
        // console.log("-> Désactiver structure", keyDispo)
        dispo.hide()
      }
    })
    this.current_dispo = String(disposition);
    const curdispo = this.dispositions[disposition]
    
    curdispo.prepared || curdispo.prepare()
    curdispo.built    || curdispo.build()

    this.setButtonDisposition(disposition)
  }

  setButtonDisposition(dispo){
    ;['H','V','E'].forEach(suffix => {
      const bouton = DGet(`footer button#btn-dispo-${suffix}`);
      bouton.classList[suffix == dispo.substring(0,1)?'add':'remove']('actif')
    })
  }

  show(){this.obj.classList.remove('hidden')}
  hide(){this.obj.classList.add('hidden')}

  get dispositions(){
    return this._dispositions || (this._dispositions = this.initDispositions())
  }
  initDispositions(){
    return {
        'Horizontal': new HorizontalSTT(this)
      , 'Vertical':   new VerticalSTT(this)
      , 'Editing':    new EditingSTT(this)
    }
  }

  /**
   * Ajouter l'élément structure +sttE+ dans l'affichage de la 
   * structure courante (en fonction de son tèepe)
   */
  append(sttE){
    // console.info("this.constructor.listing", this.constructor.listing)
    this.constructor.listing.appendChild(sttE.obj)
  }

  /**
   * Fonction retournant l'élément d'identifiant +id+
   */
  getElement(id){
    return this.table_elements[id]
  }
  /**
   * Fonction appelée pour ajouter l'élément
   */
  addElement(newElement){
    newElement.id || this.assignIdTo(newElement)
    this.elements.push(newElement)
    Object.assign(MetaSTT.current.table_elements, {[newElement.id]: newElement})
  }
  assignIdTo(elt){
    elt.data.id = MetaSTTElement.getNewId()
  }

  /**
   * Fonction générale qui relève les données actuelles de la 
   * structure avant sauvegarde
   */
  getData(){
    try {
      this.data.metadata.name = NullIfEmpty(MetaSTT.fieldName.value) || raise("Il faut définir le nom de cette structure", MetaSTT.fieldName)
      this.data.metadata.path = NullIfEmpty(MetaSTT.fieldPath.value) || raise("Il faut impérativement définir le path de cette structure.", MetaSTT.fieldPath)
      this.data.elements = this.elements.map(elt => {return elt.data})
      this.data.preferences = {
        disposition: this.disposition // 'horizontale', 'verticale', 'editing'
      }
      return true
    } catch(err) {
      return false
    }
  }

  /**
   * Fonction qui règle l'interface par rapport à la structure
   * remontée
   */
  setInterface(){
    MetaSTT.fieldName.value = this.data.metadata.name;
    MetaSTT.fieldPath.value = this.data.metadata.path;
  }

  /**
   * Fonction qui retourne true quand la structure n'est pas
   * sauvable.
   * Normalement, avec la nouvelle disposition, ça ne peut arriver
   * que lorsqu'on a initialiser une nouvelle structure et que son
   * relPath (name) n'est pas défini
   */
  IsNotSavable(){
    try {
      if (NullIfEmpty(this.relPath) === null) {
        raise("Il faut définir le nom (chemin relatif) de la structure.", MetaSTT.fieldPath)
      }   
    } catch(err){
      Flash.error(err.message)
      return true
    }
    return false
  }

  get obj(){
    return this._obj || (this._obj = DGet(`#stt-${this.constructor.classname}`))
  }
}

window.MetaSTT = MetaSTT;

