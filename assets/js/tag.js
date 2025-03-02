'use strict';
/**
 * Module de gestion des tags
 */
class Tag {

  static prepare(){
    this.observe()
  }
  static observe(){
    DGetAll('input.color', this.obj).forEach(input => {
      input.addEventListener('change', this.onChangeColorIn.bind(this, input))
    })
  }

  static onChangeColorIn(input, ev){
    const color = input.value.toUpperCase();
    input.value = color;
    input.style.color = Color.isDark(color) ? 'white' : 'black';
    input.style.backgroundColor = `#${color}`
  }


  static toggle(){
    const isOpened = this.obj.dataset.opened == 'true';
    this[isOpened?'hide':'show']()
    this.obj.dataset.opened = isOpened ? 'false' : 'true';
  }
  static show(){
    this.obj.classList.remove('hidden')
  }
  static hide(){
    this.obj.classList.add('hidden')
  }

  /**
   * Fonction d'édition des tags
   */
  static edit(){
    console.log("Je dois apprendre à éditer les tags.")
  }

  static get obj(){return this._obj || (this._obj = DGet('div#tags-window'))}

  // ======= INSTANCE ========

  constructor(data){

  }
}

window.Tag = Tag;