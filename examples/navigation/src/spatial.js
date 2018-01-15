import Navigation from './navigation'

class Spatial {
  constructor() {
    this.focusPaths = []
    this.focused = null
    this.setState = null
    this.initialized = false

    this.handleFocused = this.handleFocused.bind(this)
  }

  init(updateState) {
    if (!this.setState) this.setState = updateState

    Navigation.init()
    Navigation.makeFocusable()
    document.addEventListener('sn:focused', this.handleFocused)

    Navigation.focus()
  }

  destroy() {
    this.setState = null
    Navigation.uninit()
    document.removeEventListener('sn:focused', this.handleFocused)
  }

  handleFocused(ev) {
    this.setState(ev.detail.sectionId)
    Navigation.focus(ev.detail.sectionId)
  }

  getCurrentFocusedPath() {
    return this.focused
  }

  setCurrentFocusedPath(focusPath) {
    this.focused = focusPath
  }

  addFocusable(focusPath) {
    this.removeFocusable(focusPath)
    Navigation.add(focusPath, { selector: `#${focusPath}` })
  }

  removeFocusable(focusPath) {
    Navigation.remove(focusPath)

  }
}

window.Navigation = Navigation

export default Spatial
