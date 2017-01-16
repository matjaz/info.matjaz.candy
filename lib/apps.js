'use strict'

const api = require('./util').api
const crashedApps = {}

exports.init = function () {
  setInterval(checkCrashedApps, 60000)
}

function getApps () {
  return api('/manager/apps/app')
    .then(apps => Object.keys(apps).map(id => apps[id]))
}

// function enableDisableApp (id, enabled) {
//   return api('put', '/manager/apps/app/' + id, {
//     enabled
//   })
// }

function checkCrashedApps () {
  getApps().then(apps => {
    apps.forEach(app => {
      const id = app.id
      if (app.crashed) {
        if (!crashedApps[id]) {
          const message = app.crashedMessage || 'Crashed'
          Homey.manager('flow').trigger('appCrashed', {
            id,
            message
          })
        }
        crashedApps[id] = true
      } else if (crashedApps[id]) {
        delete crashedApps[id]
      }
    })
  })
}

exports.getApps = getApps
