'use strict';


class TimeCalc {

  static h2s(h){
    const segs = h.split(/[,:]/).reverse().map(x => {return parseInt(x)})
    let s = segs[0] || 0;
    let m = segs[1] || 0;
    h = segs[2] || 0;
    return s + m * 60 + h * 3600
  }
  static s2h(s, full = false){
    const h = parseInt(s / 3600)
    s = s - h * 3600
    let m = parseInt(s / 60)
    m = ((full == FULL || h) && m < 10) ? `0${m}` : m;
    s = s - m * 60
    s = s < 10 ? `0${s}` : s;
    const res = [m, s]
    if ( h || full == FULL) res.unshift(h) ;
    return res.join(":")
  }

  static get reghorl(){
    return "([0-9]{1,4}(?:[:,][0-9]{1,2})?(?:[:,][0-9]{1,2})?)"
  }
  static get REG_HORLOGE(){
    return this._reghor || (this._reghor = new RegExp(`^${this.reghorl}$`))
  }
  static get REG_HORLOGE_WITH_OPE(){
    return this._regopeh || (this._regopeh = new RegExp(`^${this.reghorl}([+\-])(.+)$`))
  }

  /** 
   * Fonction qui traite les temps, qui permet d'utiliser des opérations
   */
  static treate(timePlus, full = FULL){
    if ( timePlus === null ) return null;
    timePlus = timePlus.trim().replace(/ /g, "")
    let segs = timePlus.match(this.REG_HORLOGE_WITH_OPE)
    if ( segs === null ) {
      if ( timePlus.match(this.REG_HORLOGE) ) {
        full = this.isRequiredFullHorloge(timePlus, full)
        return TimeCalc.s2h(TimeCalc.h2s(timePlus), full);
      } else {
        // Sinon, on considère que c'est juste l'"ajout" qui est
        // fourni, par exemple l'expression "12h 4m"
        segs = [null, "0:00", "+", timePlus]
      }
    }
    let [_tout, horloge, operation, ajout] = segs
    // console.info("horloge", horloge)
    // Si le format de départ de l'horloge est une horloge complète, 
    // on doit retourner une horloge complète
    full = this.isRequiredFullHorloge(horloge, full)
    // Dans le cas où ajout n'est pas défini et que horloge n'est pas
    // une horloge, c'est que c'est juste l'opération qui est fournie
    if ( ajout == "" && ElementForm.NotATime(horloge) ) {
      [horloge, ajout] = ["0:00", horloge]
    }
    const secondes = ((horloge, ajout, operation) => {
      if ( /([0-9]{1,2}([smh])){1,3}/.test(ajout) ) {
        ajout = [...ajout.matchAll(/[0-9]{1,3}[smh]/g)].map(res => {return res[0]}).join("+")
        ajout = ajout.replace(/m/g,"*60").replace(/s/g,"").replace(/h/g,"*3600")
        return this.makeOpe(this.h2s(horloge), eval(ajout), operation)
      } else if ( ElementForm.IsATime(ajout) ) {
        return this.makeOpe(this.h2s(horloge), this.h2s(ajout), operation)
      } else {
        return this.makeOpe(this.h2s(horloge), eval(ajout), operation)
      }
      })(horloge, ajout, operation)
    return this.s2h(secondes, full)
  }

  static makeOpe(term1, term2, ope){
    if (ope == "+") {
      return term1 + term2
    } else {
      return term1 - term2
    }
  }

  // @return FULL s'il faut retourner une horloge complète ou false
  // dans le cas contraire.
  // On doit retourner une horloge complète (même s'il n'y a pas
  // d'heures ou de minutes) si +full+ est FULL ou si l'horloge 
  // fournie est complète.
  static isRequiredFullHorloge(horloge, full){
    if ( full == FULL ) return full ;
    return horloge.split(/[,:]/).length == 3 ? FULL : false ;
  }

}

window.TimeCalc = TimeCalc;