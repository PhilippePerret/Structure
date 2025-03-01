'use strict';

class MetaSTT {

  /**
   * La Méta-Structure courante
   */
  static get current(){return this._current}
  static set current(stt){return this._current = stt}
  
  static get fieldName(){return this._namefield || (this._namefield = DGet('input#structure-name'))}
  static get fieldPath(){return this._namefield || (this._namefield = DGet('input#structure-path'))}
  
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
    // Les containeurs
    ;[
      HorizontalSTT.listing, VerticalSTT.listing, EditingSTT.listing
    ].forEach(field => {field.innerHTML = ""})
  }

  /**
   * Le listing de chaque type de structure
   */
  static get listing(){
    return this._listing || (this._listing = DGet(`#stt-${this.classname}-listing`))
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
    // On reset tous les panneaux de structure
    this.constructor.reset()
    // Construction des trois structures
    // Non, pour le moment, on va en restere à la structure affichée
    // dernièrement.
    this.activerStructure(this.data.preferences.disposition || 'Horizontal')
    // Application des préférences
    Preferences.apply(this, this.data.preferences)
  }

  /**
   * Pour enregistrer la méta-structure
   */
  save(){
    if ( false === this.getData() ) return ;
    ServerTalk.dial({
        route: "/structure/save"
      , data:  {structure: this.data}
      , callback: this.afterSave.bind(this)
    })
  }
  afterSave(retour){
    if (false == retour.ok) return Flash.error(retour.error)
  }

  /**
   * Fonction qui active (affiche) la disposition de structure de nom
   * +disposition+
   * 
   * @param {String} disposition 'Horizontal', 'Vertical' ou 'Editing'. Permet de reconstituer le nom de la classe à invoquer.
   */
  activerStructure(disposition){
    this.current_dispo = this.dispositions[disposition];
    this.current_dispo.built || this.current_dispo.build()
  }

  get dispositions(){
    return this._dispositions || (this._dispositions = this.setDispositions())
  }
  setDispositions(){
    return {
        'Horizontal': new HorizontalSTT(this)
      , 'Vertical':   new VerticalSTT(this)
      , 'Editing':    new EditingSTT(this)
    }
  }

  setDisposition(dispo, boutonDispo){
    ;(this.currentDispoButton || DGet('button#btn-dispo-H')).classList.remove('actif')
    this.currentDispoButton = boutonDispo
    boutonDispo.classList.add('actif')
    console.log("Je dois apprendre à afficher la dispo ", dispo)
  }

  /**
   * Ajouter l'élément structure +sttE+ dans l'affichage de la 
   * structure courante (en fonction de son tèepe)
   */
  append(sttE){
    // console.log("Je dois ajouter l'élément suivant à la structure", sttE, this)
    this.obj.appendChild(sttE.obj)
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
    // Todo : activer la disposition ?
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
}

window.MetaSTT = MetaSTT;

