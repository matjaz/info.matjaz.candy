const system = require('./lib/system')

module.exports = [
    {
        method: 'GET',
        path:   '/systemInfo',
        fn: function(callback, args) {
            system.getSystemInfo()
                .then(result => callback(null, result))
                .catch(callback)
        }
    }
]
