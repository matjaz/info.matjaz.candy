'use strict'

var system = require('./system')
var api = require('./util').api
var flowTimeoutConditionTimestamps = {}
var checkActionSystemNewFirmwareTimeout
const language = Homey.manager('i18n').getLanguage()
const checkTimeOut = 15 * 60 * 1000

exports.init = function () {
  Homey.manager('flow').trigger('systemInitiated', null, null)
  Homey.manager('flow').on('condition.systemCloudConnected', onConditiononSystemCloudConnected)
  Homey.manager('flow').on('condition.systemDeviceLastUpdate', onConditiononSystemDeviceLastUpdate)
  Homey.manager('flow').on('condition.systemDeviceLastUpdate.deviceCapability.autocomplete', onConditiononSystemDeviceLastUpdateDeviceCapabilityAutocomplete)
  Homey.manager('flow').on('condition.systemDeviceLastUpdate.units.autocomplete', onConditiononSystemDeviceLastUpdateUnitsAutocomplete)
  Homey.manager('flow').on('condition.systemFlowTimeout', onConditiononSystemFlowTimeout)
  Homey.manager('flow').on('condition.systemFlowTimeout.units.autocomplete', onConditionSystemFlowTimeoutUnitsAutocomplete)
  Homey.manager('flow').on('condition.systemNewFirmware', onConditionSystemNewFirmware)

  checkActionSystemNewFirmwareTimeout = setInterval(checkActionSystemNewFirmware, checkTimeOut)
  checkActionSystemNewFirmware()
}

function checkActionSystemNewFirmware () {
  var tokens = {}
  system.getUpdateInfo().then(function (updateInfo) {
    if (!updateInfo.length || !updateInfo[0].version) return Promise.reject('no_update')
    tokens.newVersion = updateInfo[0].version
    return system.getSystemInfo()
  }).then(function (systemInfo) {
    tokens.currentVersion = systemInfo.homey_version
    Homey.manager('flow').trigger('systemNewFirmware', tokens, null)
    if (checkActionSystemNewFirmwareTimeout) clearTimeout(checkActionSystemNewFirmwareTimeout)
  })
}

function onConditiononSystemCloudConnected (callback) {
  system.getSystemInfo().then(function (result) {
    callback(null, result.cloud_connected)
  }).catch(callback)
}

function onConditiononSystemDeviceLastUpdate (callback, args) {
  var deviceCapability = args.deviceCapability.id.split('.')
  getDevice(deviceCapability[0]).then(device => {
    if (!('lastUpdated' in device)) return callback('not supported firmware')
    if (!(deviceCapability[1] in device.lastUpdated)) return callback('invalid capability')
    var lastUpdated = new Date(device.lastUpdated[deviceCapability[1]]).getTime() || 0
    callback(null, timeDiffNow(lastUpdated, args.units.id) < args.timeout)
  }).catch(callback)
}

function onConditiononSystemDeviceLastUpdateDeviceCapabilityAutocomplete (callback, args) {
  var list = []
  getAllDevices().then(devices => {
    devices.forEach(device => {
      Object.keys(device.capabilities).forEach(capabilityId => {
        list.push({id: [device.id, capabilityId].join('.'), name: [device.name, device.capabilities[capabilityId].title[language]].join(' - ')})
      })
    })
    callback(null,
      list
      .filter(item => item.name.toLowerCase().includes(args.query.toLowerCase()))
      .sort((a, b) => (a.name > b.name ? 1 : -1)))
  }).catch(callback)
}

function onConditiononSystemDeviceLastUpdateUnitsAutocomplete (callback, args) {
  var list = [
    {id: 'seconds', name: __('timeUnits.seconds')},
    {id: 'minutes', name: __('timeUnits.minutes')},
    {id: 'hours', name: __('timeUnits.hours')},
    {id: 'days', name: __('timeUnits.days')},
    {id: 'weeks', name: __('timeUnits.weeks')},
    {id: 'months', name: __('timeUnits.months')},
    {id: 'years', name: __('timeUnits.years')}
  ]
  callback(null, list.filter(item =>
    item.name.toLowerCase().includes(args.query.toLowerCase())
  ))
}

function onConditionSystemFlowTimeoutUnitsAutocomplete (callback, args) {
  var list = [
    {id: 'seconds', name: __('timeUnits.seconds')},
    {id: 'minutes', name: __('timeUnits.minutes')},
    {id: 'hours', name: __('timeUnits.hours')},
    {id: 'days', name: __('timeUnits.days')},
    {id: 'weeks', name: __('timeUnits.weeks')},
    {id: 'months', name: __('timeUnits.months')},
    {id: 'years', name: __('timeUnits.years')}
  ]
  var results = list.filter((item) =>
    item.name.toLowerCase().includes(args.query.toLowerCase())
  ).map((item) =>
    ({id: item.id, name: item.name, marker: new Date().getTime()})
  )

  callback(null, results)
}

function onConditiononSystemFlowTimeout (callback, args) {
  if (flowTimeoutConditionTimestamps[args.units.marker]) {
    if (timeDiffNow(flowTimeoutConditionTimestamps[args.units.marker], args.units.id) < args.timeout) {
      return callback(null, false)
    }
  }
  flowTimeoutConditionTimestamps[args.units.marker] = new Date().getTime()
  callback(null, true)
}

function onConditionSystemNewFirmware (callback, args) {
  system.getUpdateInfo().then(function (result) {
    callback(null, (result.length && result[0].version))
  }).catch(callback)
}

function getAllDevices () {
  return api('/manager/devices/device')
    .then(devices => Object.keys(devices).map(id => devices[id]))
}

function getDevice (deviceId) {
  return api('/manager/devices/device/' + deviceId)
}

function timeDiffNow (start, units) {
  var millisDiff = new Date().getTime() - start
  switch (units) {
    case 'seconds':
      return millisDiff / 1000
    case 'minutes':
      return millisDiff / 1000 / 60
    case 'hours':
      return millisDiff / 1000 / 60 / 60
    case 'days':
      return millisDiff / 1000 / 60 / 60 / 24
    case 'weeks':
      return millisDiff / 1000 / 60 / 60 / 24 / 7
    case 'months':
      return millisDiff / 1000 / 60 / 60 / 24 / 365 * 12
    case 'years':
      return millisDiff / 1000 / 60 / 60 / 24 / 365
  }
  return millisDiff
}
