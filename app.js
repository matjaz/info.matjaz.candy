'use strict'

const apps = require('./lib/apps')
const system = require('./lib/system')
const folderFlows = require('./lib/folderFlows')
const systemFlows = require('./lib/systemFlows')

exports.init = function () {
  apps.init()
  system.init()
  folderFlows.init()
  systemFlows.init()

  Homey.log('Candies! Nom nom!')
}
