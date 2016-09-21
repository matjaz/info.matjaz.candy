'use strict'

const api = require('./util').api

exports.init = function () {
  Homey.manager('flow').on('action.reboot', onFlowReboot)
}

function onFlowReboot (callback) {
  api('post', '/manager/system/reboot').then(r => {
    callback(null, true)
  })
}
