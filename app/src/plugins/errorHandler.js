class ErrorHandler {

  handleError (err) {
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

  Vue.config.errorHandler = function (err) {
    instance.handleError(err)
  }
}

export { ErrorHandler }
