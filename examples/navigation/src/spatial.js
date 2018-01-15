import Navigation from './navigation';

class Spatial {
  constructor() {
    this.focusPaths = []
    this.focused = null
    this.setState = null
    this.initialized = false

    // this.handleKeyDown = this.onKeyDown.bind(this)
    // this.init()

    Navigation.init()
    document.addEventListener('sn:focused', (ev) => {
      this.setState(ev.detail.sectionId)
    })

    setTimeout(function() {
      Navigation.makeFocusable()
      Navigation.focus()
    }, 1000);
  }

  withSetState(setFocus) {
    if (!this.setState) {
      this.setState = setFocus
    }
  }

  // init() {
  //   document.body.addEventListener('keydown', this.handleKeyDown)
  // }

  // remove() {
  //   document.body.removeEventListener('keydown', this.handleKeyDown)
  // }

  getCurrentFocusedPath() {
    return this.focused
  }

  setCurrentFocusedPath(focusPath) {
    this.focused = focusPath
  }

  // focusOnClosest(direction) {
  //   direction = KEYMAPPING[direction]

  //   // when not exist any, focus in first
  //   if (!this.focused) {
  //     this.focused = this.focusPaths[0]
  //     this.setState(this.focusPaths[0])
  //     return undefined
  //   }

  //   const index = this.focusPaths.indexOf(this.focused)

  //   if (direction === 'right' || direction === 'down') {
  //     // should verify direction
  //     if ((index + 1) >= this.focusPaths.length) {
  //       return undefined
  //     }

  //     this.focused = this.focusPaths[index + 1]
  //     this.setState(this.focusPaths[index + 1])
  //     const element = document.querySelector(`#${this.focusPaths[index + 1]}`)
  //     console.log(element)
  //     element.focus()
  //   } else if (direction === 'left' || direction === 'up') {
  //     // should verify direction
  //     if (index === 0) {
  //       return undefined;
  //     }

  //     this.focused = this.focusPaths[index - 1]
  //     this.setState(this.focusPaths[index - 1])
  //     const element = document.querySelector(`#${this.focusPaths[index - 1]}`)
  //     console.log(element)
  //     element.focus()
  //   }
  // }

  // onKeyDown(evt) {
  //   if (
  //     evt.altKey ||
  //     evt.ctrlKey ||
  //     evt.metaKey ||
  //     evt.shiftKey
  //   ) {
  //     return;
  //   }

  //   this.focusOnClosest(evt.keyCode)
  //   return evt.preventDefault()
  // }

  addFocusable(focusPath) {
    // if (this.focusPaths.indexOf(focusPath) > -1) {
    //   return undefined;
    // }

    // this.focusPaths.push(focusPath)
    Navigation.remove(focusPath);
    Navigation.add(focusPath, {selector: `#${focusPath}`});
  }
}

window.Navigation = Navigation

export default Spatial
