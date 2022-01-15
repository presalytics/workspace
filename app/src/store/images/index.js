import Worker from './images.worker?worker'

const worker = new Worker({type: "module"})

const initialState = {}

const images = {
  namespaced: true,
  state: initialState,
  actions: {
    sendToWorkerThread(context, payload) {
      worker.postMessage(payload)
    },
    async getImage(context, payload) {
      return await new Promise( (resolve) => {
        const listener = worker.addEventListener('message', function(e) {
          if (e.data.apiKey === payload.apiKey) {
            worker.removeEventListener('message', listener)
            resolve(e.data)
          }
        })
        payload.request = "getImage"
        worker.postMessage(payload)
      })
    },
  }
}

export {worker as imageWorker, images} 

