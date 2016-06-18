'use strict'

const api = require('./util').api

exports.init = function () {
  Homey.manager('flow').on('action.enableFolderFlows', onFlowEnableFolderFlows)
  Homey.manager('flow').on('action.disableFolderFlows', onFlowDisableFolderFlows)
  Homey.manager('flow').on('action.enableFolderFlows.folder.autocomplete', onFlowFolderFlowsAutocomplete)
  Homey.manager('flow').on('action.disableFolderFlows.folder.autocomplete', onFlowFolderFlowsAutocomplete)
}

function onFlowEnableFolderFlows (callback, args) {
  updateFolderFlows(args.folder.id, true, callback)
}

function onFlowDisableFolderFlows (callback, args) {
  updateFolderFlows(args.folder.id, false, callback)
}

function onFlowFolderFlowsAutocomplete (callback, args) {
  const query = args.query.toLowerCase()
  getAllFolders().then(folders => {
    callback(null, folders.filter(folder => folder.title.toLowerCase().includes(query)).map(folder => ({
      id: folder.id,
      name: folder.title
    })))
  })
}

function updateFolderFlows (folderId, enabled, callback) {
  return getFolderFlows(folderId).then(flows => {
    var count = 1
    var success = true
    var done = function () {
      if (!--count) {
        callback(null, success)
      }
    }
    flows.forEach(flow => {
      count++
      updateFlowEnabled(flow.id, enabled)
        .then(done)
        .catch(() => {
          success = false
          done()
        })
    })
    done()
  })
}

function getAllFolders () {
  return api('/manager/flow/folder')
}

function getFolderFlows (folderId) {
  return api('/manager/flow/flow').then(flows =>
    flows.filter(flow => flow.folder === folderId)
  )
}

function updateFlowEnabled (flowId, enabled) {
  return api('put', `/manager/flow/flow/${flowId}/enabled`, {enabled})
}
