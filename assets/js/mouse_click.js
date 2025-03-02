'use strict';
/**
 * Module permettant de gérer les clicks de souris et, particulière-
 * ment, de savoir à quelle position temporelle du film ils corres-
 * pondent.
 */

class MouseClick {

  // ========== I N S T A N C E ===========

  constructor(ev) {
    this.x = ev.clientX;
    this.y = ev.clientY;
  }

  get time(){
    return this._time || (this._time = TimeCalc.p2s(this.x))
  }
  get horloge(){
    return this._horloge || (this._horloge = TimeCalc.p2h(this.x, true))
  }
  get duree(){
    return this._duree || (this._duree = TimeCalc.p2h(this.x, false))
  }
}

window.MouseClick = MouseClick;