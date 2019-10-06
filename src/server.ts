import {httpServer, server} from './app'
import {webSocket as rxWS} from 'rxjs/webSocket'
import {map, mapTo, tap} from 'rxjs/internal/operators'
import {interval, timer} from 'rxjs'
import WebSocket from 'ws'

/**
 * Error Handler. Provides full stack - remove for production
 */

/**
 * Start Express server.
 */
// const server = app.listen(app.get("port"), () => {
//     console.log(
//         "  App is running at http://localhost:%d in %s mode",
//         app.get("port"),
//         app.get("env")
//     );
//     console.log("  Press CTRL-C to stop\n");
// });
export const PORT = 3000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})

export const webSocketSubject = rxWS({
  url: `ws://localhost:3001/`,
  WebSocketCtor: require('ws'),
  // to parse string messages
  deserializer: e => e
})

webSocketSubject
  .subscribe((message: MessageEvent) =>
    console.log('message received via subscriber:', message.data))


// const ws = new WebSocket(`ws://localhost:${PORT}${server.subscriptionsPath}`)
const wss = new WebSocket.Server({port: 3001})

// wss.on('connection', function connection(ws) {
//     ws.on('message', function incoming(message) {
//         console.log('received: %s', message);
//     });
//
//     ws.send('something');
// });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    console.log('logged from server "on message":', data)
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  })
})


const ws = new WebSocket(`ws://localhost:${3001}${'/'}`)

ws.on('open', () => ws.send('Hello from on'))

interval(5000).pipe(
  map(() => {
      console.log('clients connected:', wss.clients.size)
      ws.send('Hello from interval')
  })
)
  .subscribe()

ws.on('message', function incoming(data) {
  console.log('logged from ws.on:', data)
})

export default httpServer
