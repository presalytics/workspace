class ErrorHandler {
  constructor (options = {}) {
    const opts = Object.assign({
      mode: process.env.NODE_ENV,
      serverUrl: process.env.VUE_APP_,
    })
    this.mode = opts.mode
    this.serverUrl = opts.serverUrl
  }

  handleError (err, vm, info) {
    if (this.mode !== 'production') {
      // eslint-disable-next-line
      console.error(err)
    }
  }
}

let instance

ErrorHandler.install = (Vue, options = {}) => {
  if (!instance) {
    instance = new ErrorHandler(options)
  }

  Vue.config.errorHandler = function (err, vm, info) {
    instance.handleError(err, vm, info)
  }
}

export { ErrorHandler }
