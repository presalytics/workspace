import * as signalR from '@microsoft/signalr/dist/webworker/signalr.js'
import { CloudEvent } from 'cloudevents'


export default class SignalRConnectionManager {
  constructor(options = {}) {

    if (!options.inboundEventHandler) throw new Error('SignalRConnectionManager requires the option "inboundEventHandler" containing a function to be invoked on receipt of events from the hub')
    if (!options.accessTokenFn) throw new Error('the "accessTokenFn" options is required.')
    
    this.eventHandler = options.inboundEventHandler
    this.accessTokenFn = options.accessTokenFn
    this.hubUrl = import.meta.env.VITE_APP_HUB_URL || import.meta.env.VITE_APP_EVENTS_HOST + "/hub"
    this.debug = import.meta.env.DEV

    this.connection =  new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {accessTokenFactory: options.accessTokenFn})
      .configureLogging(signalR.LogLevel.Information)
      .build();
    
    this.connection.onclose( async () => await this.startConnection())

    this.connection.on('HandleEvent', (message) => {
      let ce = new CloudEvent(message)
      if (this.debug) console.log("API Event received", message)  // eslint-disable-line
      this.broadcast(ce)
    })
  }

  async startConnection() {
    try {
      await this.connection.start()
      console.log("Connected to Presalytics Event Hub.  Now streaming real-time events.") // eslint-disable-line
    } catch (err) {
      console.error(err) // eslint-disable-line
      setTimeout(this.startConnection, 5000)
    }
  }

  sendEvent (eventData) {
    let ce = new CloudEvent(eventData)
    if (this.debug) console.log("Sending Event to API", eventData) // eslint-disable-line
    this.connection.invoke("SendEvent", ce)
  }

  broadcast(cloudEvent) {
    return this.eventHandler(cloudEvent)
  }
}
