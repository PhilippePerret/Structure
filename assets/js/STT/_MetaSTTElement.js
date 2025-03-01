'use strict';

class MetaSTTElement {

  // ======== I N S T A N C E ==========

  constructor(data){
    this.data = data
  }

  /**
   * Toutes les propriétés de l'élément structurel, que ce soit une
   * scène ou une séquence (ou autre à l'avenir)
   */
  // Saved Data
  get id(){return this.data.id }
  get pitch(){return this.data.pitch || this.data.text}
  get ideality(){return this.data.ideality}
  get type(){return this.data.type}
  get time(){return this.data.time}
  get duree(){return this.data.duree}
  get tension(){return this.data.tension}
  get color(){return this.data.color}
  // Volatile Data
  get realTime(){return this._realtime || (this._realtime = TimeCalc.h2s(this.time))}
  get realDuree(){return this._realduree || (this._realduree = TimeCalc.h2s(this.duree))}

}

window.MetaSTTElement = MetaSTTElement;