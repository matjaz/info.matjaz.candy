'use strict'

const system = require('./lib/system')
const folderFlows = require('./lib/folderFlows')
const systemFlows = require('./lib/systemFlows')

exports.init = function () {
  Homey.log('Candies! Nom nom!')

  system.init()
  folderFlows.init()
  systemFlows.init()
}
