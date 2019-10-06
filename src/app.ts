import express from 'express'
import compression from 'compression'
import session from 'express-session'
import bodyParser from 'body-parser'
import lusca from 'lusca'
import mongo from 'connect-mongo'
import flash from 'express-flash'
import path from 'path'
import mongoose from 'mongoose'
import passport from 'passport'
import bluebird from 'bluebird'
import {MONGODB_URI, SESSION_SECRET} from './util/secrets'
import {ApolloServer, gql, makeExecutableSchema, PubSub} from 'apollo-server-express'
import * as homeController from './controllers/home'
import * as userController from './controllers/user'
import * as apiController from './controllers/api'
import * as contactController from './controllers/contact'
import * as passportConfig from './config/passport'
import {UserChange} from './changeStreams'
import {initializeWatchers} from './util/changeStreamWatcher'
import * as http from 'http'
import errorHandler from 'errorhandler'

export const typeDefs = gql`
    type Query {
        hello: String
    }

    type Subscription {
        helloDispatched: String
    }

`
export const pubsub = new PubSub() // graphql subscriptions
const HELLO = 'HELLO'

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => {
      pubsub.publish(HELLO, 'query payload')
        .catch(console.log)
      return 'Hello world!'
    },
  },
  Subscription: {
    helloDispatched: {
      resolve: (payload: unknown) => payload,
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([HELLO]),
    },
  },
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export const server = new ApolloServer({
  schema,
  context: async ({req, connection}) => {
    if (connection) {
      // check connection for metadata
      return connection.context
    } else {
      // check from req
      const token = req.headers.authorization || ''

      return {token}
    }
  },
  subscriptions: {
    onConnect: () => console.log('Connected!')
  }
})

const MongoStore = mongo(session)


// Create Express server
const app = express()

// Connect to MongoDB
const mongoUrl = MONGODB_URI
mongoose.Promise = bluebird

// apollo
server.applyMiddleware({app, path: '/graphql'})

mongoose.connect(mongoUrl, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  },
).catch(err => {
  console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err)
  // process.exit();
})
// Express configuration
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path
  } else if (req.user &&
    req.path == '/account') {
    req.session.returnTo = req.path
  }
  next()
})
app.use(
  express.static(path.join(__dirname, 'public'), {maxAge: 31557600000})
)

initializeWatchers([
  UserChange
])

/**
 * Primary app routes.
 */
app.get('/', homeController.index)
app.get('/login', userController.getLogin)
app.post('/login', userController.postLogin)
app.get('/logout', userController.logout)
app.get('/forgot', userController.getForgot)
app.post('/forgot', userController.postForgot)
app.get('/reset/:token', userController.getReset)
app.post('/reset/:token', userController.postReset)
app.get('/signup', userController.getSignup)
app.post('/signup', userController.postSignup)
app.get('/contact', contactController.getContact)
app.post('/contact', contactController.postContact)
app.get('/account', passportConfig.isAuthenticated, userController.getAccount)
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile)
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword)
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount)
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink)

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi)
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook)

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile']}))
app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), (req, res) => {
  res.redirect(req.session.returnTo || '/')
})

app.use(errorHandler())

export const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)
//
// import {webSocket} from 'rxjs/webSocket'
// import {PORT, webSocketSubject} from './server'
// import {tap} from 'rxjs/internal/operators'




export default app
