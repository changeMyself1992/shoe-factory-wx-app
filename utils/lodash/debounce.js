
  var root = {
    Array: Array,
    Date: Date,
    Error: Error,
    Function: Function,
    Math: Math,
    Object: Object,
    RegExp: RegExp,
    String: String,
    TypeError: TypeError,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval
  }
  var NAN = 0 / 0
  var freeParseInt = parseInt
  var objectProto = Object.prototype
  var nativeObjectToString = objectProto.toString
  var symToStringTag = Symbol ? Symbol.toStringTag : undefined
  var undefinedTag = '[object Undefined]'
  var nullTag = '[object Null]'
  var symbolTag = '[object Symbol]'
  var MAX_ARRAY_LENGTH = 4294967295
  var nativeMax = Math.max
  var nativeMin = Math.min
  var ctxNow = Date && Date.now !== root.Date.now && Date.now
  var FUNC_ERROR_TEXT = 'Expected a function'
  var reTrim = /^\s+|\s+$/g
  var reIsBinary = /^0b[01]+$/i
  var reIsOctal = /^0o[0-7]+$/i
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i
  var now = ctxNow || function () {
    return root.Date.now()
  }
  function isObjectLike(value) {
    return value != null && typeof value === 'object'
  }
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag)
    var tag = value[symToStringTag]

    try {
      value[symToStringTag] = undefined
      var unmasked = true
    } catch (e) {
      console.log()
    }

    var result = nativeObjectToString.call(value)
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag
      } else {
        delete value[symToStringTag]
      }
    }
    return result
  }
  function objectToString(value) {
    return nativeObjectToString.call(value)
  }
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value)
  }

  function LodashWrapper(value, chainAll) {
    this.__wrapped__ = value
    this.__actions__ = []
    this.__chain__ = !!chainAll
    this.__index__ = 0
    this.__values__ = undefined
  }
  function isSymbol(value) {
    return typeof value === 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) === symbolTag)
  }
  function LazyWrapper(value) {
    this.__wrapped__ = value
    this.__actions__ = []
    this.__dir__ = 1
    this.__filtered__ = false
    this.__iteratees__ = []
    this.__takeCount__ = MAX_ARRAY_LENGTH
    this.__views__ = []
  }
  function copyArray(source, array) {
    var index = -1
    var length = source.length

    array || (array = Array(length))
    while (++index < length) {
      array[index] = source[index]
    }
    return array
  }
  function wrapperClone(wrapper) {
    if (wrapper instanceof LazyWrapper) {
      return wrapper.clone()
    }
    var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__)
    result.__actions__ = copyArray(wrapper.__actions__)
    result.__index__ = wrapper.__index__
    result.__values__ = wrapper.__values__
    return result
  }

  function lodash(value) {
    if (isObjectLike(value) && !Array.isArray(value) && !(value instanceof LazyWrapper)) {
      if (value instanceof LodashWrapper) {
        return value
      }
      if (hasOwnProperty.call(value, '__wrapped__')) {
        return wrapperClone(value)
      }
    }
    return new LodashWrapper(value)
  }
  function toNumber(value) {
    if (typeof value === 'number') {
      return value
    }
    if (isSymbol(value)) {
      return NAN
    }
    if (isObject(value)) {
      var other = typeof value.valueOf === 'function' ? value.valueOf() : value
      value = isObject(other) ? (other + '') : other
    }
    if (typeof value !== 'string') {
      return value === 0 ? value : +value
    }
    value = value.replace(reTrim, '')
    var isBinary = reIsBinary.test(value)
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value)
  }
  function isObject(value) {
    var type = typeof value
    return value != null && (type === 'object' || type === 'function')
  }
  function debounce(func, wait, options) {
    var lastArgs
    var lastThis
    var maxWait
    var result
    var timerId
    var lastCallTime
    var lastInvokeTime = 0
    var leading = false
    var maxing = false
    var trailing = true

    if (typeof func !== 'function') {
      throw new TypeError(FUNC_ERROR_TEXT)
    }
    wait = toNumber(wait) || 0
    if (isObject(options)) {
      leading = !!options.leading
      maxing = 'maxWait' in options
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait
      trailing = 'trailing' in options ? !!options.trailing : trailing
    }

    function invokeFunc(time) {
      var args = lastArgs
      var thisArg = lastThis

      lastArgs = lastThis = undefined
      lastInvokeTime = time
      result = func.apply(thisArg, args)
      return result
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait)
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime
      var timeSinceLastInvoke = time - lastInvokeTime
      var timeWaiting = wait - timeSinceLastCall

      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime
      var timeSinceLastInvoke = time - lastInvokeTime

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
    }

    function timerExpired() {
      var time = now()
      if (shouldInvoke(time)) {
        return trailingEdge(time)
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time))
    }

    function trailingEdge(time) {
      timerId = undefined

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time)
      }
      lastArgs = lastThis = undefined
      return result
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId)
      }
      lastInvokeTime = 0
      lastArgs = lastCallTime = lastThis = timerId = undefined
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now())
    }

    function debounced() {
      var time = now()
      var isInvoking = shouldInvoke(time)

      lastArgs = arguments
      lastThis = this
      lastCallTime = time

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime)
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait)
          return invokeFunc(lastCallTime)
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait)
      }
      return result
    }
    debounced.cancel = cancel
    debounced.flush = flush
    return debounced
  }
  // lodash.debounce = debounce

// module.exports = {
//   debounce
// }
module.exports = debounce

