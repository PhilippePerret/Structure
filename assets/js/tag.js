'use strict';
/**
 * Module de gestion des tags
 */
const TAG_PROPERTIES = {
    name:       {default: ""}
  , color:      {default: ""}
  , background: {default: ""}
  , method:     {default: ""}
}


class Tag {

  static prepare(){
    this.tags   = []
    this.table  = {}
    const firstTag = DGet('div.tag', this.listing)
    this.TAG_CLONE = firstTag.cloneNode(true)
    firstTag.remove()
    this.observe()
  }

  /**
   * Appelée au chargement de la structure pour définir les tags de 
   * cette structure
   */
  static feeds(dataTags){
    dataTags.forEach(dataTag => this.addTag(dataTag))
  }

  /**
   * Pour enregistrer les tags de la structure
   */
  static save(){
    Flash.notice("Enregistrement des tags…")
    MetaSTT.current.setTags(this.getTagData())
    this.hide()
  }

  static getTagData(){
    return this.tags.map(tag => {return tag.getData()})
  }

  static addTag(data){
    const clone = this.TAG_CLONE.cloneNode(true)
    const index = this.listing.children.lenght + 1;
    const newTag = new Tag(Object.assign(data || {}, {obj: clone, index: index}))
    newTag.build()
    newTag.nameField.focus()
    this.tags.push(newTag)
    Object.assign(this.table, {[newTag.id]: newTag})
  }
  static onRemoveTag(tag, ev){
    tag.obj.remove()
    delete this.table[tag.id]
    this.tags = this.tags.filter(t => {t.id != tag.id})
  }

  static observe(){
    this.filterField.addEventListener('input', this.onChangeFilter.bind(this))
  }

  static onChangeFilter(ev){
    const value = this.filterField.value;
    if ( value == "" ) {
      this.forEachTag(tag => {tag.display = true})
    } else {
      const pattern = new RegExp(value, "i")
      this.forEachTag(tag => {tag.display = tag.match(pattern)})
    }
  }

  static forEachTag(fonction){
    this.tags.forEach(tag => fonction.call(null, tag))
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

  static get filterField(){return this._filterfield || (this._filterfield = DGet('input#tag-filter', this.obj))}
  static get listing(){return this._listing||(this._listing = DGet('div.listing', this.obj))}
  static get obj(){return this._obj || (this._obj = DGet('div#tags-window'))}

  // ======= INSTANCE ========

  constructor(data){
    data.index || data.obj || raise("Il faut fournir soit l'index soit l'objet…")
    this.data = data;
  }

  /**
   * Retourne les données du tags, prises dans les champs
   */
  getData(){
    const data = {};
    Object.keys(TAG_PROPERTIES).forEach(prop => {
      Object.assign(data, {[prop]: this[prop]})
    })
    return data
  }

  build(){
    this.obj.id = `tag-${this.index}`
    Object.keys(TAG_PROPERTIES).forEach(prop => {
      this[prop] = this.data[prop] || TAG_PROPERTIES[prop].default
    })
    this.constructor.listing.appendChild(this.obj)
    this.observe()
  }
  observe(){
    DGetAll('input.color', this.obj).forEach(input => {
      input.addEventListener('change', function(ev){
        input.value = input.value.toUpperCase();
        Color.onChangeColorIn.call(Color, input)
      })
    })
    DGet('.btn-del', this.obj).addEventListener('click', Tag.onRemoveTag.bind(Tag, this))
  }

  /**
   * Retourne true si le tag contient le pattern
   */
  match(pattern){return this.name.match(pattern)}

  /**
   * Affiche ou masque le tag
   */
  set display(value){this.obj.style.display = value ? 'block' : 'none'}

  get id(){return this._id || (this._id = `tag-${this.index}`)}
  get name(){return NullIfEmpty(this.nameField.value)}
  set name(v){return this.nameField.value = v}
  get color(){return NullIfEmpty(this.colorField.value)}
  set color(v){return this.colorField.value = v}
  get background(){return NullIfEmpty(this.backgroundField.value)}
  set background(v){return this.backgroundField.value = v}
  get method(){return NullIfEmpty(this.methodField.value)}
  set method(v){return this.methodField.value = v}
  
  get index(){return this.data.index || this.obj.dataset.index}

  get nameField(){return this._namef || (this._namef = DGet('.tag-name', this.obj))}
  get colorField(){return this._colorf || (this._colorf = DGet('.tag-foreground', this.obj))}
  get backgroundField(){return this._bckgf || (this._bckgf = DGet('.tag-background', this.obj))}
  get methodField(){return this._methodf || (this._methodf = DGet('.tag-method', this.obj))}
  get obj(){return this._obj || (this._obj = this.data.obj || DGet(`#tag-${this.index}`))}
}

window.Tag = Tag;