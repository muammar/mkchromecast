import protochain from 'protochain'

function serializerr (obj = {}) {
  const chain = protochain(obj)
  .filter(obj => obj !== Object.prototype)
  return [obj]
  .concat(chain)
  .map(item => Object.getOwnPropertyNames(item))
  .reduce((result, names) => {
    names.forEach(name => {
      result[name] = obj[name]
    })
    return result
  }, {})
}

module.exports = serializerr
serializerr.serializerr = serializerr
export default serializerr
