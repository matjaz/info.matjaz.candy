'use strict'

const api = require('./util').api
var flowTimeoutConditionTimestamps = {}

exports.init = function () {
  Homey.manager('flow').trigger('systemInitiated', null, null)
  Homey.manager('flow').on('condition.systemCloudConnected', onConditiononSystemCloudConnected)
  Homey.manager('flow').on('condition.systemFlowTimeout', onConditiononSystemFlowTimeout)
  Homey.manager('flow').on('condition.systemFlowTimeout.units.autocomplete', onConditionSystemFlowTimeoutUnitsAutocomplete)
}

function onConditiononSystemCloudConnected (callback, args) {
  getCloudStatus().then(function(result) {
    callback(null, result.cloud_connected)
  })
}

function getCloudStatus () {
  return api('/manager/system')
}

function onConditionSystemFlowTimeoutUnitsAutocomplete (callback, args) {
  var list = [
    {id: 'seconds', name: __("timeUnits.seconds")},
    {id: 'minutes', name: __("timeUnits.minutes")},
    {id: 'hours', name: __("timeUnits.hours")},
    {id: 'days', name: __("timeUnits.days")},
    {id: 'weeks', name: __("timeUnits.weeks")},
    {id: 'months', name: __("timeUnits.months")},
    {id: 'years', name: __("timeUnits.years")},
  ]

  callback(null, list.filter(
    item => item.name.toLowerCase().includes(args.query.toLowerCase())).map(
      item => ({id: item.id, name: item.name, marker: new Date().getTime()})
    )
  )
}

function onConditiononSystemFlowTimeout (callback, args) {
//  console.log(args, flowTimeoutConditionTimestamps)
  if (flowTimeoutConditionTimestamps[args.units.marker]) {
    if (timeDiffNow(flowTimeoutConditionTimestamps[args.units.marker], args.units.id) < args.timeout) {
      return callback(null, false)
    }
  }
  flowTimeoutConditionTimestamps[args.units.marker] = new Date().getTime()
  callback(null, true)
}

function timeDiffNow (start, units) {
  var millisDiff = new Date().getTime() - start
  switch(units) {
    case 'seconds':
      return millisDiff / 1000
      break;
    case 'minutes':
      return millisDiff / 1000 / 60
      break;
    case 'hours':
      return millisDiff / 1000 / 60 / 60
      break;
    case 'days':
      return millisDiff / 1000 / 60 / 60 / 24
      break;
    case 'weeks':
      return millisDiff / 1000 / 60 / 60 / 24 / 7
      break;
    case 'months':
      return millisDiff / 1000 / 60 / 60 / 12 / 365
      break;
    case 'years':
      return millisDiff / 1000 / 60 / 60 / 24 / 356
      break;
    default:
      return millisDiff
  }
}
