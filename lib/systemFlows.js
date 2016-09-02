'use strict'

exports.init = function () {
  Homey.manager('flow').trigger('systemInitiated', null, null)
}
