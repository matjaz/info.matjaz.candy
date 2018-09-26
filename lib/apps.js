'use strict'

const api = require('./util').api
const crashedApps = {}

exports.init = function () {
  Homey.manager('flow').on('action.enable_app', onEnableApp)
  Homey.manager('flow').on('action.enable_app.app.autocomplete', onRestartAppIdAutocomplete)
  Homey.manager('flow').on('action.disable_app', onDisableApp)
  Homey.manager('flow').on('action.disable_app.app.autocomplete', onRestartAppIdAutocomplete)
  Homey.manager('flow').on('action.restart_app', onRestartApp)
  Homey.manager('flow').on('action.restart_app.app.autocomplete', onRestartAppIdAutocomplete)
  Homey.manager('flow').on('action.restart_app_id', onRestartAppById)
  setInterval(checkCrashedApps, 60000)
}

function onEnableApp (callback, args) {
  enableDisableApp(args.app.id, true)
    .then(result => callback(null, !!result))
    .catch(callback)
}

function onDisableApp (callback, args) {
  enableDisableApp(args.app.id, false)
    .then(result => callback(null, !!result))
    .catch(callback)
}

function onRestartApp (callback, args) {
  restartApp(args.app.id, callback)
}

function onRestartAppById (callback, args) {
  restartApp(args.id.trim(), callback)
}

function onRestartAppIdAutocomplete (callback, args) {
  const query = args.query.toLowerCase()
  getApps().then(apps => {
    callback(null, apps.filter(app => app.name.en.toLowerCase().includes(query)).map(app => ({
      id: app.id,
      name: app.name.en
    })))
  })
  .catch(callback)
}

function getApps () {
  return api('/manager/apps/app')
    .then(apps => Object.keys(apps).map(id => apps[id]))
}

function enableDisableApp (id, enabled) {
  return api('put', '/manager/apps/app/' + id, {
    enabled
  })
}

function restartApp (id, callback) {
  api('post', `/manager/apps/app/${id}/restart`)
    .then(result => callback(null, !!result))
    .catch(callback)
}

function checkCrashedApps () {
  getApps().then(apps => {
    apps.forEach(app => {
      const {id} = app
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
  .catch(e => {Homey.error(e)})
}

exports.getApps = getApps
