const { onRequest } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')

const app = require('./server')

setGlobalOptions({
  maxInstances: 10,
  region: 'europe-west3',
})

exports.api = onRequest(app)
