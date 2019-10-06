import {httpServer, server} from './app'
import {webSocket} from 'rxjs/webSocket'
import {map, mapTo, tap} from 'rxjs/internal/operators'
import {interval, timer} from 'rxjs'
import WebSocket from 'ws'

// (global as any).WebSocket = require('ws')

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

// export const webSocketSubject = webSocket(`ws://localhost:3000/graphql`)
//
// webSocketSubject
//   .subscribe(message => console.log('message received', message))
//


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
        console.log('logged from server', data)
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

const ws = new WebSocket(`ws://localhost:${3001}${'/'}`)

ws.on('open', () => ws.send('WS DATA'))

interval(2000).pipe(
  map(() => ws.send('WS DATA'))
)
  .subscribe()

ws.on('message', function incoming(data) {
    console.log(data);
});

export default httpServer
