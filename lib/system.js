'use strict'

const setCookieParser = require('set-cookie-parser')
const util = require('./util')
const api = util.api
const apiRaw = util.apiRaw

exports.init = function () {
  Homey.manager('flow').on('action.reboot', onFlowReboot)
  Homey.manager('flow').on('action.restart_mcu', onFlowRestartMCU)
  Homey.manager('flow').on('action.notification', onNotification)
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

function onFlowRestartMCU (callback) {
  api('post', '/manager/system/microcontroller/reset').then(() => {
    callback(null, true)
  }).catch(callback)
}

function onNotification (callback, args) {
		Homey.manager('notifications').createNotification({
			excerpt: args.noti
		}, callback);
}


function getSystemInfo () {
  return apiRaw('/manager/system').then(result => {
    var data = result.data
    var statusCode = result.response.statusCode
    if (statusCode >= 200 && statusCode < 400) {
      if (!('cloud_connected' in data.result)) {
        // https://github.com/athombv/homey/issues/907
        var cookies = setCookieParser(result.response.headers['set-cookie'])
        var homeyCloud = cookies.find(c => c.name === 'homey_cloud')
        if (homeyCloud) {
          data.result.cloud_connected = homeyCloud.value === '1'
        }
      }
      return data.result
    } else {
      return Promise.reject(data && data.result || data)
    }
  })
}

function getUpdateInfo () {
  return api('/manager/updates/update')
}

exports.getSystemInfo = getSystemInfo
exports.getUpdateInfo = getUpdateInfo
