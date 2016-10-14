'use strict'

const api = require('./util').api

exports.init = function () {
  Homey.manager('flow').on('action.enableFolderFlows', onFlowEnableFolderFlows)
  Homey.manager('flow').on('action.disableFolderFlows', onFlowDisableFolderFlows)
  Homey.manager('flow').on('action.enableFolderFlows.folder.autocomplete', onFlowFolderFlowsAutocomplete)
  Homey.manager('flow').on('action.disableFolderFlows.folder.autocomplete', onFlowFolderFlowsAutocomplete)
}

function onFlowEnableFolderFlows (callback, args) {
  updateFolderFlows(args.folder.id, args.which, true, callback)
}

function onFlowDisableFolderFlows (callback, args) {
  updateFolderFlows(args.folder.id, args.which, false, callback)
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

function updateFolderFlows (folderId, which, enabled, callback) {
  return getFolderFlows(folderId, which).then(flows => {
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

function getFoldersTree () {
  return getAllFolders().then(folders => {
    var flatFolders = folders.reduce((r, folder) => {
      r[folder.id] = folder
      return r
    }, {})
    return folders.reduce((r, folder) => {
      var parentId = folder.folder
      if (parentId) {
        var parent = flatFolders[parentId]
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(folder)
      } else {
        r[folder.id] = folder
      }
      return r
    }, {})
  })
}

function getFolderDescendants (folderId) {
  function getDescendants (folder) {
    var descendants = []
    if (folder.children) {
      folder.children.forEach(child => {
        descendants.push(child.id)
        var childDescendants = getDescendants(child)
        if (childDescendants.length) {
          descendants = descendants.concat(childDescendants)
        }
      })
    }
    return descendants
  }
  return getFoldersTree().then(folders => getDescendants(folders[folderId]))
}

function getAllFolders () {
  return api('/manager/flow/folder')
    .then(folders => Object.keys(folders).map(id => folders[id]))
}

function getFolderFlows (folderId, which) {
  return Promise.all([
    api('/manager/flow/flow'),
    which === 'all' ? getFolderDescendants(folderId) : []
  ]).then(result => {
    const flows = result[0]
    const folderIds = result[1]
    return Object.keys(flows)
      .filter(flowId => folderIds.indexOf(flows[flowId].folder) !== -1)
      .map(flowId => flows[flowId])
  })
}

function updateFlowEnabled (flowId, enabled) {
  return api('put', '/manager/flow/flow/' + flowId, {enabled})
}
