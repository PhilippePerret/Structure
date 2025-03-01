'use strict';

class MetaSTT {

  /**
   * La Méta-Structure courante
   */
  static get current(){return this._current}
  static set current(stt){return this._current = stt}
  
  static get fieldName(){return this._namefield || (this._namefield = DGet('input#structure-name'))}
  
  /**
   * Initialisation de la méta-structure
   * (appelée à l'ouverture de l'application)
   */
  static init(){
    const relPath = NullIfEmpty(this.fieldName.value)
    if ( relPath ) {
      this.current = new MetaSTT(relPath);
      this.current.load()
    } else {
      console.info("Aucun nom de structure. Je ne charge rien.")
    }

  }

  // ======== I N S T A N C E ==========

  constructor(relPath){
    this.relPath = relPath
  }

  /**
   * Chargement de la méta-structure courante
   */
  load(){
    console.info("-> load")
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
    console.log("Je dois m'occuper des données ", this.data)
  }

  /**
   * Pour enregistrer la méta-structure
   */
  save(){
    if ( this.IsNotSavable() ) return
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
   * Ajouter l'élément structure +sttE+ dans l'affichage de la 
   * structure courante (en fonction de son tèepe)
   */
  append(sttE){
    // console.log("Je dois ajouter l'élément suivant à la structure", sttE, this)
    this.obj.appendChild(sttE.obj)
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
        raise("Il faut définir le nom (chemin relatif) de la structure.", MetaSTT.fieldName)
      }   
    } catch(err){
      Flash.error(err.message)
      return true
    }
    return false
  }
}

window.MetaSTT = MetaSTT;

