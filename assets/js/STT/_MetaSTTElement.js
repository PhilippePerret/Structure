'use strict';

class MetaSTTElement {

  /**
   * Fonction qui calcule et fournit un identifiant unique pour le
   * type +type+ (scene ou seq pour le moment)
   */
  static getNewId(){
    const partDate = String(new Date().getTime()).replace("\.", "")
    const partAlea = String(parseInt(Math.random() * 100))
    const chunk4 = (partDate + partAlea).match(/.{1,4}/g)
    return `sttelt-${chunk4.join("-")}`
  }


  // ======== I N S T A N C E ==========

  constructor(data){
    this.data = data || {}
    this.editBinding = this.edit.bind(this)
  }

  /**
   * Toutes les propriétés de l'élément structurel, que ce soit une
   * scène ou une séquence (ou autre à l'avenir)
   */
  // Saved Data
  get id(){return this.data.id }
  get pitch(){return this.data.pitch}
  get ideality(){return this.data.ideality}
  get type(){return this.data.type}
  get stype(){return this.data.stype}
  get time(){return this.data.time}
  get duree(){return this.data.duree}
  get tension(){return this.data.tension}
  get color(){return this.data.color}
  // Volatile Data
  get realTime(){return this._realtime || (this._realtime = TimeCalc.h2s(this.time))}
  get realDuree(){return this._realduree || (this._realduree = TimeCalc.h2s(this.duree))}
  get TYPE(){return this._typemaj || (this._typemaj = this.type.toUpperCase())}
  get colorData(){return Color.get(this.color)}
  get fgColor(){return this.colorData.fg}
  get bgColor(){return this.colorData.bg}

  /**
   * Forcer la réactualisation des données après un changement.
   */
  reset(){
    delete this._realtime
    delete this._realduree
    delete this._typemaj
  }

  /**
   * Fonction pour éditer l'élément (seulement utile pour les
   * structure verticales et horizontales). l'édition se fait
   * dans le formulaire flottant
   */
  edit(ev){
    // TODO Placer le formulaire près de la souris
    FormElement.setData(this)
  }

  /**
   * Fonction pour actualiser l'élément à partir des données
   * transmises
   */
  update(newData){
    Object.assign(this.data, newData)
    this.reset()
    // TODO apprendre à updater l'élément
    console.error("Il faut apprendre à updater l'élément")
  }

  /**
   * Propriété : couleur qui ne sera jamais blanche
   */
  get safeBackgroundColor(){
    let bg = this.bgColor;
    if ( !bg || bg == "white" || bg == "#FFFFFF" ) {bg = "black"}
    return bg
  }
}


window.MetaSTTElement = MetaSTTElement;