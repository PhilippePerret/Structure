'use strict';

/**
 * Gestion de l'état de application
 */

class AppState {

  static save(dataState){
    ServerTalk.dial({
        route: "/app/save_state"
      , data: {state: dataState}
      , callback: this.afterSave.bind(this)
    })
  }
  static afterSave(retour){
    if (retour.ok){
      console.info("État (state) sauvé")
    } else { raise(retour.error) }
  }

}
window.AppState = AppState;