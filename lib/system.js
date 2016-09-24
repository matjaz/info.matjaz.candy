'use strict'

const api = require('./util').api

exports.init = function () {
  Homey.manager('flow').on('action.reboot', onFlowReboot)
}

function onFlowReboot (callback) {
  getSystemInfo().then(r => {
    if (r.uptime > 300) {
      // prevent infinite reboot loop
      api('post', '/manager/system/reboot').then(() => {
        callback(null, true)
      }).catch(callback)
    } else {
      callback(null, false)
    }
  }).catch(callback)
}

function getSystemInfo () {
  return api('/manager/system')
}