interface String{
  // eslint-disable-next-line no-unused-vars
  interpolate(params: unknown): string
}

interface Document {
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void>
  mozFullScreenElement?: Element
  msFullscreenElement?: Element
  webkitFullscreenElement?: Element
}

interface Element {
  msRequestFullscreen?: () => Promise<void>
  mozRequestFullscreen?: () => Promise<void>
  webkitRequestFullscreen?: () => Promise<void>
  static ALLOW_KEYBOARD_INPUT?: boolean
  
}