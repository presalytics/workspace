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
    getImage(context, payload) {
      payload.request = "getImage"
      worker.postMessage(payload)
    },
  }
}

export {worker as imageWorker, images} 

