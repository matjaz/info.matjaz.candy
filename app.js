'use strict'

const folderFlows = require('./lib/folderFlows')
const systemFlows = require('./lib/systemFlows')

exports.init = function () {
  Homey.log('Candies! Nom nom!')

  folderFlows.init()
  systemFlows.init()
}
