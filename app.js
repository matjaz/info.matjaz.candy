'use strict'

const folderFlows = require('./lib/folderFlows')

exports.init = function () {
  Homey.log('Candies! Nom nom!')
  folderFlows.init()
}
