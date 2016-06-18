const http = require('http.min')

exports.api = function (method, path, data) {
  if (!path) {
    path = method
    method = 'get'
  }
  var bearerToken = getToken()
  var options = {
    uri: `http://127.0.0.1/api${path}`,
    json: data || true
  }
  if (bearerToken) {
    options.headers = {
      authorization: `Bearer ${bearerToken}`
    }
  }
  return http[method](options)
    .then(result => {
      var data = result.data
      var statusCode = result.response.statusCode
      if (statusCode >= 200 && statusCode < 400) {
        return data.result
      } else {
        return Promise.reject(data && data.result || data)
      }
    })
}

function getToken () {
  return Homey.manager('settings').get('apiToken')
}
