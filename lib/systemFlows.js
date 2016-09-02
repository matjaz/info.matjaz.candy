'use strict'

const api = require('./util').api

exports.init = function () {
  Homey.manager('flow').trigger('systemInitiated', null, null)
  Homey.manager('flow').on('condition.systemCloudConnected', onConditiononSystemCloudConnected)
}

function onConditiononSystemCloudConnected (callback, args) {
  getCloudStatus().then(function(result) {
    callback(null, result.cloud_connected)
  })
}

function getCloudStatus () {
  return api('/manager/system')
}
