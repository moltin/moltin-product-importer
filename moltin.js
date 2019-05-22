(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fetch-everywhere'), require('es6-promise'))
    : typeof define === 'function' && define.amd ? define(['exports', 'fetch-everywhere', 'es6-promise'], factory)
      : (factory((global.moltin = {})))
}(this, ((exports) => {
  'use strict'

  function _typeof(obj) {
    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
      _typeof = function (obj) {
        return typeof obj
      }
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
      }
    }

    return _typeof(obj)
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function')
    }
  }

  function _defineProperties(target, props) {
    for (let i = 0; i < props.length; i++) {
      const descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps)
    if (staticProps) _defineProperties(Constructor, staticProps)
    return Constructor
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      })
    } else {
      obj[key] = value
    }

    return obj
  }

  function _objectSpread(target) {
    for (let i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {}
      let ownKeys = Object.keys(source)

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(sym => Object.getOwnPropertyDescriptor(source, sym).enumerable))
      }

      ownKeys.forEach((key) => {
        _defineProperty(target, key, source[key])
      })
    }

    return target
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
      throw new TypeError('Super expression must either be null or a function')
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true,
      },
    })
    if (superClass) _setPrototypeOf(subClass, superClass)
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o)
    }
    return _getPrototypeOf(o)
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p
      return o
    }

    return _setPrototypeOf(o, p)
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }

    return self
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === 'object' || typeof call === 'function')) {
      return call
    }

    return _assertThisInitialized(self)
  }

  const version = '0.0.0-semantic-release'

  const LocalStorageFactory =
  /* #__PURE__ */
  (function () {
    function LocalStorageFactory() {
      _classCallCheck(this, LocalStorageFactory)

      if (typeof localStorage === 'undefined' || localStorage === null) {
        const _require = require('node-localstorage')
        const { LocalStorage } = _require

        this.localStorage = new LocalStorage('./localStorage')
      } else {
        this.localStorage = window.localStorage
      }
    }

    _createClass(LocalStorageFactory, [{
      key: 'set',
      value: function set(key, value) {
        return this.localStorage.setItem(key, value)
      },
    }, {
      key: 'get',
      value: function get(key) {
        return this.localStorage.getItem(key)
      },
    }, {
      key: 'delete',
      value: function _delete(key) {
        return this.localStorage.removeItem(key)
      },
    }])

    return LocalStorageFactory
  }())

  const Config = function Config(options) {
    _classCallCheck(this, Config)

    const { application } = options
    const { client_id } = options
    const { client_secret } = options
    const { currency } = options
    const { host } = options
    const { storage } = options
    this.application = application
    this.client_id = client_id
    this.client_secret = client_secret
    this.host = host || 'api.moltin.com'
    this.protocol = 'https'
    this.version = 'v2'
    this.currency = currency
    this.auth = {
      expires: 3600,
      uri: 'oauth/access_token',
    }
    this.sdk = {
      version,
      language: 'JS',
    }
    this.storage = storage || new LocalStorageFactory()
  }

  const { toString } = Object.prototype

  function isFunc(obj) {
    return toString.call(obj) === '[object Function]'
  }

  const classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function')
    }
  }

  const createClass = (function () {
    function defineProperties(target, props) {
      for (let i = 0; i < props.length; i++) {
        const descriptor = props[i]
        descriptor.enumerable = descriptor.enumerable || false
        descriptor.configurable = true
        if ('value' in descriptor) descriptor.writable = true
        Object.defineProperty(target, descriptor.key, descriptor)
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps)
      if (staticProps) defineProperties(Constructor, staticProps)
      return Constructor
    }
  }())

  function icPart(str) {
    return str.split('').map(c => `(?:${c.toUpperCase()}|${c.toLowerCase()})`).join('')
  }

  function remove(arr, elem) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === elem) {
        Array.prototype.splice.call(arr, i, 1)
      }
    }
  }

  function hasProp(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
  }

  const instances = {}

  const Inflector = (function () {
    createClass(Inflector, null, [{
      key: 'getInstance',
      value: function getInstance(locale) {
        instances[locale] = instances[locale] || new Inflector()
        return instances[locale]
      },
    }])

    function Inflector() {
      classCallCheck(this, Inflector)

      this.plurals = []
      this.singulars = []
      this.uncountables = []
      this.humans = []
      this.acronyms = {}
      this.acronymRegex = /(?=a)b/
    }

    createClass(Inflector, [{
      key: 'acronym',
      value: function acronym(word) {
        this.acronyms[word.toLowerCase()] = word

        const values = []

        for (const key in this.acronyms) {
          if (hasProp(this.acronyms, key)) {
            values.push(this.acronyms[key])
          }
        }

        this.acronymRegex = new RegExp(values.join('|'))
      },
    }, {
      key: 'plural',
      value: function plural(rule, replacement) {
        if (typeof rule === 'string') {
          remove(this.uncountables, rule)
        }

        remove(this.uncountables, replacement)
        this.plurals.unshift([rule, replacement])
      },
    }, {
      key: 'singular',
      value: function singular(rule, replacement) {
        if (typeof rule === 'string') {
          remove(this.uncountables, rule)
        }

        remove(this.uncountables, replacement)
        this.singulars.unshift([rule, replacement])
      },
    }, {
      key: 'irregular',
      value: function irregular(singular, plural) {
        remove(this.uncountables, singular)
        remove(this.uncountables, plural)

        const s0 = singular[0]
        const sRest = singular.substr(1)

        const p0 = plural[0]
        const pRest = plural.substr(1)

        if (s0.toUpperCase() === p0.toUpperCase()) {
          this.plural(new RegExp(`(${s0})${sRest}$`, 'i'), `$1${pRest}`)
          this.plural(new RegExp(`(${p0})${pRest}$`, 'i'), `$1${pRest}`)

          this.singular(new RegExp(`(${s0})${sRest}$`, 'i'), `$1${sRest}`)
          this.singular(new RegExp(`(${p0})${pRest}$`, 'i'), `$1${sRest}`)
        } else {
          const sRestIC = icPart(sRest)
          const pRestIC = icPart(pRest)

          this.plural(new RegExp(`${s0.toUpperCase() + sRestIC}$`), p0.toUpperCase() + pRest)
          this.plural(new RegExp(`${s0.toLowerCase() + sRestIC}$`), p0.toLowerCase() + pRest)
          this.plural(new RegExp(`${p0.toUpperCase() + pRestIC}$`), p0.toUpperCase() + pRest)
          this.plural(new RegExp(`${p0.toLowerCase() + pRestIC}$`), p0.toLowerCase() + pRest)

          this.singular(new RegExp(`${s0.toUpperCase() + sRestIC}$`), s0.toUpperCase() + sRest)
          this.singular(new RegExp(`${s0.toLowerCase() + sRestIC}$`), s0.toLowerCase() + sRest)
          this.singular(new RegExp(`${p0.toUpperCase() + pRestIC}$`), s0.toUpperCase() + sRest)
          this.singular(new RegExp(`${p0.toLowerCase() + pRestIC}$`), s0.toLowerCase() + sRest)
        }
      },
    }, {
      key: 'uncountable',
      value: function uncountable() {
        for (var _len = arguments.length, words = Array(_len), _key = 0; _key < _len; _key++) {
          words[_key] = arguments[_key]
        }

        this.uncountables = this.uncountables.concat(words)
      },
    }, {
      key: 'human',
      value: function human(rule, replacement) {
        this.humans.unshift([rule, replacement])
      },
    }, {
      key: 'clear',
      value: function clear() {
        const scope = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all'

        if (scope === 'all') {
          this.plurals = []
          this.singulars = []
          this.uncountables = []
          this.humans = []
        } else {
          this[scope] = []
        }
      },
    }])
    return Inflector
  }())

  function en(inflector) {
    inflector.plural(/$/, 's')
    inflector.plural(/s$/i, 's')
    inflector.plural(/^(ax|test)is$/i, '$1es')
    inflector.plural(/(octop|vir)us$/i, '$1i')
    inflector.plural(/(octop|vir)i$/i, '$1i')
    inflector.plural(/(alias|status)$/i, '$1es')
    inflector.plural(/(bu)s$/i, '$1ses')
    inflector.plural(/(buffal|tomat)o$/i, '$1oes')
    inflector.plural(/([ti])um$/i, '$1a')
    inflector.plural(/([ti])a$/i, '$1a')
    inflector.plural(/sis$/i, 'ses')
    inflector.plural(/(?:([^f])fe|([lr])f)$/i, '$1$2ves')
    inflector.plural(/(hive)$/i, '$1s')
    inflector.plural(/([^aeiouy]|qu)y$/i, '$1ies')
    inflector.plural(/(x|ch|ss|sh)$/i, '$1es')
    inflector.plural(/(matr|vert|ind)(?:ix|ex)$/i, '$1ices')
    inflector.plural(/^(m|l)ouse$/i, '$1ice')
    inflector.plural(/^(m|l)ice$/i, '$1ice')
    inflector.plural(/^(ox)$/i, '$1en')
    inflector.plural(/^(oxen)$/i, '$1')
    inflector.plural(/(quiz)$/i, '$1zes')

    inflector.singular(/s$/i, '')
    inflector.singular(/(ss)$/i, '$1')
    inflector.singular(/(n)ews$/i, '$1ews')
    inflector.singular(/([ti])a$/i, '$1um')
    inflector.singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/i, '$1sis')
    inflector.singular(/(^analy)(sis|ses)$/i, '$1sis')
    inflector.singular(/([^f])ves$/i, '$1fe')
    inflector.singular(/(hive)s$/i, '$1')
    inflector.singular(/(tive)s$/i, '$1')
    inflector.singular(/([lr])ves$/i, '$1f')
    inflector.singular(/([^aeiouy]|qu)ies$/i, '$1y')
    inflector.singular(/(s)eries$/i, '$1eries')
    inflector.singular(/(m)ovies$/i, '$1ovie')
    inflector.singular(/(x|ch|ss|sh)es$/i, '$1')
    inflector.singular(/^(m|l)ice$/i, '$1ouse')
    inflector.singular(/(bus)(es)?$/i, '$1')
    inflector.singular(/(o)es$/i, '$1')
    inflector.singular(/(shoe)s$/i, '$1')
    inflector.singular(/(cris|test)(is|es)$/i, '$1is')
    inflector.singular(/^(a)x[ie]s$/i, '$1xis')
    inflector.singular(/(octop|vir)(us|i)$/i, '$1us')
    inflector.singular(/(alias|status)(es)?$/i, '$1')
    inflector.singular(/^(ox)en/i, '$1')
    inflector.singular(/(vert|ind)ices$/i, '$1ex')
    inflector.singular(/(matr)ices$/i, '$1ix')
    inflector.singular(/(quiz)zes$/i, '$1')
    inflector.singular(/(database)s$/i, '$1')

    inflector.irregular('person', 'people')
    inflector.irregular('man', 'men')
    inflector.irregular('child', 'children')
    inflector.irregular('sex', 'sexes')
    inflector.irregular('move', 'moves')
    inflector.irregular('zombie', 'zombies')

    inflector.uncountable('equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'jeans', 'police')
  }

  const defaults$1 = {
    en,
  }

  function inflections(locale, fn) {
    if (isFunc(locale)) {
      fn = locale
      locale = null
    }

    locale = locale || 'en'

    if (fn) {
      fn(Inflector.getInstance(locale))
    } else {
      return Inflector.getInstance(locale)
    }
  }

  for (const locale in defaults$1) {
    inflections(locale, defaults$1[locale])
  }

  function applyInflections(word, rules) {
    let result = `${word}`
    let rule
    let regex
    let replacement

    if (result.length === 0) {
      return result
    }
    const match = result.toLowerCase().match(/\b\w+$/)

    if (match && inflections().uncountables.indexOf(match[0]) > -1) {
      return result
    }
    for (let i = 0, ii = rules.length; i < ii; i++) {
      rule = rules[i]

      regex = rule[0]
      replacement = rule[1]

      if (result.match(regex)) {
        result = result.replace(regex, replacement)
        break
      }
    }

    return result
  }

  function pluralize(word) {
    const locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en'

    return applyInflections(word, inflections(locale).plurals)
  }

  function singularize(word) {
    const locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en'

    return applyInflections(word, inflections(locale).singulars)
  }

  function underscore(camelCasedWord) {
    let result = `${camelCasedWord}`

    result = result.replace(new RegExp(`(?:([A-Za-z\\d])|^)(${inflections().acronymRegex.source})(?=\\b|[^a-z])`, 'g'), (match, $1, $2) => `${$1 || ''}${$1 ? '_' : ''}${$2.toLowerCase()}`)

    result = result.replace(/([A-Z\d]+)([A-Z][a-z])/g, '$1_$2')
    result = result.replace(/([a-z\d])([A-Z])/g, '$1_$2')
    result = result.replace(/-/g, '_')

    return result.toLowerCase()
  }

  // prettier-ignore
  const DEFAULT_APPROXIMATIONS = {
    À: 'A',
    Á: 'A',
    Â: 'A',
    Ã: 'A',
    Ä: 'A',
    Å: 'A',
    Æ: 'AE',
    Ç: 'C',
    È: 'E',
    É: 'E',
    Ê: 'E',
    Ë: 'E',
    Ì: 'I',
    Í: 'I',
    Î: 'I',
    Ï: 'I',
    Ð: 'D',
    Ñ: 'N',
    Ò: 'O',
    Ó: 'O',
    Ô: 'O',
    Õ: 'O',
    Ö: 'O',
    '×': 'x',
    Ø: 'O',
    Ù: 'U',
    Ú: 'U',
    Û: 'U',
    Ü: 'U',
    Ý: 'Y',
    Þ: 'Th',
    ß: 'ss',
    à: 'a',
    á: 'a',
    â: 'a',
    ã: 'a',
    ä: 'a',
    å: 'a',
    æ: 'ae',
    ç: 'c',
    è: 'e',
    é: 'e',
    ê: 'e',
    ë: 'e',
    ì: 'i',
    í: 'i',
    î: 'i',
    ï: 'i',
    ð: 'd',
    ñ: 'n',
    ò: 'o',
    ó: 'o',
    ô: 'o',
    õ: 'o',
    ö: 'o',
    ø: 'o',
    ù: 'u',
    ú: 'u',
    û: 'u',
    ü: 'u',
    ý: 'y',
    þ: 'th',
    ÿ: 'y',
    Ā: 'A',
    ā: 'a',
    Ă: 'A',
    ă: 'a',
    Ą: 'A',
    ą: 'a',
    Ć: 'C',
    ć: 'c',
    Ĉ: 'C',
    ĉ: 'c',
    Ċ: 'C',
    ċ: 'c',
    Č: 'C',
    č: 'c',
    Ď: 'D',
    ď: 'd',
    Đ: 'D',
    đ: 'd',
    Ē: 'E',
    ē: 'e',
    Ĕ: 'E',
    ĕ: 'e',
    Ė: 'E',
    ė: 'e',
    Ę: 'E',
    ę: 'e',
    Ě: 'E',
    ě: 'e',
    Ĝ: 'G',
    ĝ: 'g',
    Ğ: 'G',
    ğ: 'g',
    Ġ: 'G',
    ġ: 'g',
    Ģ: 'G',
    ģ: 'g',
    Ĥ: 'H',
    ĥ: 'h',
    Ħ: 'H',
    ħ: 'h',
    Ĩ: 'I',
    ĩ: 'i',
    Ī: 'I',
    ī: 'i',
    Ĭ: 'I',
    ĭ: 'i',
    Į: 'I',
    į: 'i',
    İ: 'I',
    ı: 'i',
    Ĳ: 'IJ',
    ĳ: 'ij',
    Ĵ: 'J',
    ĵ: 'j',
    Ķ: 'K',
    ķ: 'k',
    ĸ: 'k',
    Ĺ: 'L',
    ĺ: 'l',
    Ļ: 'L',
    ļ: 'l',
    Ľ: 'L',
    ľ: 'l',
    Ŀ: 'L',
    ŀ: 'l',
    Ł: 'L',
    ł: 'l',
    Ń: 'N',
    ń: 'n',
    Ņ: 'N',
    ņ: 'n',
    Ň: 'N',
    ň: 'n',
    ŉ: '\'n',
    Ŋ: 'NG',
    ŋ: 'ng',
    Ō: 'O',
    ō: 'o',
    Ŏ: 'O',
    ŏ: 'o',
    Ő: 'O',
    ő: 'o',
    Œ: 'OE',
    œ: 'oe',
    Ŕ: 'R',
    ŕ: 'r',
    Ŗ: 'R',
    ŗ: 'r',
    Ř: 'R',
    ř: 'r',
    Ś: 'S',
    ś: 's',
    Ŝ: 'S',
    ŝ: 's',
    Ş: 'S',
    ş: 's',
    Š: 'S',
    š: 's',
    Ţ: 'T',
    ţ: 't',
    Ť: 'T',
    ť: 't',
    Ŧ: 'T',
    ŧ: 't',
    Ũ: 'U',
    ũ: 'u',
    Ū: 'U',
    ū: 'u',
    Ŭ: 'U',
    ŭ: 'u',
    Ů: 'U',
    ů: 'u',
    Ű: 'U',
    ű: 'u',
    Ų: 'U',
    ų: 'u',
    Ŵ: 'W',
    ŵ: 'w',
    Ŷ: 'Y',
    ŷ: 'y',
    Ÿ: 'Y',
    Ź: 'Z',
    ź: 'z',
    Ż: 'Z',
    ż: 'z',
    Ž: 'Z',
    ž: 'z',
    А: 'A',
    Б: 'B',
    В: 'V',
    Г: 'G',
    Д: 'D',
    Е: 'E',
    Ё: 'E',
    Ж: 'ZH',
    З: 'Z',
    И: 'I',
    Й: 'J',
    К: 'K',
    Л: 'L',
    М: 'M',
    Н: 'N',
    О: 'O',
    П: 'P',
    Р: 'R',
    С: 'S',
    Т: 'T',
    У: 'U',
    Ф: 'F',
    Х: 'KH',
    Ц: 'C',
    Ч: 'CH',
    Ш: 'SH',
    Щ: 'SHCH',
    Ъ: '',
    Ы: 'Y',
    Ь: '',
    Э: 'E',
    Ю: 'YU',
    Я: 'YA',
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'j',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }

  const DEFAULT_REPLACEMENT_CHAR = '?'

  const instances$1 = {}

  const Transliterator = (function () {
    createClass(Transliterator, null, [{
      key: 'getInstance',
      value: function getInstance(locale) {
        instances$1[locale] = instances$1[locale] || new Transliterator()
        return instances$1[locale]
      },
    }])

    function Transliterator() {
      classCallCheck(this, Transliterator)

      this.approximations = {}

      for (const char in DEFAULT_APPROXIMATIONS) {
        this.approximate(char, DEFAULT_APPROXIMATIONS[char])
      }
    }

    createClass(Transliterator, [{
      key: 'approximate',
      value: function approximate(char, replacement) {
        this.approximations[char] = replacement
      },
    }, {
      key: 'transliterate',
      value: function transliterate(string, replacement) {
        const _this = this

        return string.replace(/[^\u0000-\u007f]/g, c => _this.approximations[c] || replacement || DEFAULT_REPLACEMENT_CHAR)
      },
    }])
    return Transliterator
  }())

  function buildRelationshipData(type, ids) {
    let data = []
    if (ids === null || ids.length === 0) return data

    if (typeof ids === 'string') {
      const obj = {
        type: underscore(type),
        id: ids,
      }
      if (type === 'main-image') return obj
      return [obj]
    }

    if (Array.isArray(ids)) {
      data = ids.map(id => ({
        type: underscore(type),
        id,
      }))
    }

    return data
  }
  function formatUrlResource(type) {
    if (type === 'main-image') return type
    return pluralize(type)
  }
  function createCartIdentifier() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16))
  }
  function cartIdentifier(storage) {
    const cartId = createCartIdentifier()

    if (storage.get('mcart') !== null) {
      return storage.get('mcart')
    }

    storage.set('mcart', cartId)
    return cartId
  }
  function parseJSON(response) {
    if (response.status === 204) {
      return new Promise(((resolve) => {
        resolve({
          status: response.status,
          ok: response.ok,
          json: '{}',
        })
      }))
    }

    if (response.status === 429) {
      const error = {
        errors: [{
          status: 429,
        }],
      }
      return new Promise(((resolve) => {
        resolve({
          status: response.status,
          ok: response.ok,
          json: error,
        })
      }))
    }

    return new Promise((resolve => response.json().then(json => resolve({
      status: response.status,
      ok: response.ok,
      json,
    }))))
  }

  function formatFilterString(type, filter) {
    const filterStringArray = Object.keys(filter).map((key) => {
      const value = filter[key]
      let queryString = ''.concat(key, ',').concat(value)
      if (_typeof(value) === 'object') {
        queryString = Object.keys(value).map(attr => ''.concat(key, '.').concat(attr, ',').concat(value[attr]))
      }
      return ''.concat(type, '(').concat(queryString, ')')
    })
    return filterStringArray.join(':')
  }

  function formatQueryString(key, value) {
    if (key === 'limit' || key === 'offset') {
      return 'page'.concat(value)
    }

    if (key === 'filter') {
      const filterValues = Object.keys(value).map(filter => formatFilterString(filter, value[filter]))
      return ''.concat(key, '=').concat(filterValues.join(':'))
    }

    return ''.concat(key, '=').concat(value)
  }

  function buildQueryParams(_ref) {
    const { includes } = _ref
    const { sort } = _ref
    const { limit } = _ref
    const { offset } = _ref
    const { filter } = _ref
    const query = {}

    if (includes) {
      query.include = includes
    }

    if (sort) {
      query.sort = ''.concat(sort)
    }

    if (limit) {
      query.limit = '[limit]='.concat(limit)
    }

    if (offset) {
      query.offset = '[offset]='.concat(offset)
    }

    if (filter) {
      query.filter = filter
    }

    return Object.keys(query).map(k => formatQueryString(k, query[k])).join('&')
  }

  function buildURL(endpoint, params) {
    if (params.includes || params.sort || params.limit || params.offset || params.filter) {
      const paramsString = buildQueryParams(params)
      return ''.concat(endpoint, '?').concat(paramsString)
    }

    return endpoint
  }
  function buildRequestBody(body) {
    let parsedBody

    if (body) {
      parsedBody = '{\n      "data": '.concat(JSON.stringify(body), '\n    }')
    }

    return parsedBody
  }
  function buildCartItemData(id) {
    const quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null
    const type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'cart_item'
    const payload = {
      type,
    }

    if (type === 'cart_item') {
      Object.assign(payload, {
        id,
        quantity: parseInt(quantity, 10),
      })
    }

    if (type === 'promotion_item') {
      Object.assign(payload, {
        code: id,
      })
    }

    return payload
  }
  function buildCartCheckoutData(customer, billing_address, shipping_address) {
    let parsedCustomer = customer
    if (typeof customer === 'string') {
      parsedCustomer = {
        id: customer,
      }
    }
    return {
      customer: parsedCustomer,
      billing_address,
      shipping_address,
    }
  }
  function resetProps(instance) {
    const inst = instance;
    ['includes', 'sort', 'limit', 'offset', 'filter'].forEach(e => delete inst[e])
  }

  const Credentials =
  /* #__PURE__ */
  (function () {
    function Credentials(client_id, access_token, expires) {
      _classCallCheck(this, Credentials)

      this.client_id = client_id
      this.access_token = access_token
      this.expires = expires
    }

    _createClass(Credentials, [{
      key: 'toObject',
      value: function toObject() {
        return {
          client_id: this.client_id,
          access_token: this.access_token,
          expires: this.expires,
        }
      },
    }])

    return Credentials
  }())

  const RequestFactory =
  /* #__PURE__ */
  (function () {
    function RequestFactory(config) {
      _classCallCheck(this, RequestFactory)

      this.config = config
      this.storage = config.storage
    }

    _createClass(RequestFactory, [{
      key: 'authenticate',
      value: function authenticate() {
        const { config } = this
        const { storage } = this

        if (!config.client_id) {
          throw new Error('You must have a client_id set')
        }

        if (!config.host) {
          throw new Error('You have not specified an API host')
        }

        const body = {
          grant_type: config.client_secret ? 'client_credentials' : 'implicit',
          client_id: config.client_id,
        }

        if (config.client_secret) {
          body.client_secret = config.client_secret
        }

        const promise = new Promise(((resolve, reject) => {
          fetch(''.concat(config.protocol, '://').concat(config.host, '/').concat(config.auth.uri), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: Object.keys(body).map(k => ''.concat(encodeURIComponent(k), '=').concat(encodeURIComponent(body[k]))).join('&'),
          }).then(parseJSON).then((response) => {
            if (response.ok) {
              resolve(response.json)
            }

            reject(response.json)
          }).catch(error => reject(error))
        }))
        promise.then((response) => {
          const credentials = new Credentials(config.client_id, response.access_token, response.expires)
          storage.set('moltinCredentials', JSON.stringify(credentials))
        })
        return promise
      },
    }, {
      key: 'send',
      value: function send(uri, method) {
        const _this = this

        const body = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined
        const token = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined
        const instance = arguments.length > 4 ? arguments[4] : undefined
        const { config } = this
        const { storage } = this
        const promise = new Promise(((resolve, reject) => {
          const credentials = JSON.parse(storage.get('moltinCredentials'))

          const req = function req(_ref) {
            const { access_token } = _ref
            const headers = {
              Authorization: 'Bearer: '.concat(access_token),
              'Content-Type': 'application/json',
              'X-MOLTIN-SDK-LANGUAGE': config.sdk.language,
              'X-MOLTIN-SDK-VERSION': config.sdk.version,
            }

            if (config.application) {
              headers['X-MOLTIN-APPLICATION'] = config.application
            }

            if (config.currency) {
              headers['X-MOLTIN-CURRENCY'] = config.currency
            }

            if (token) {
              headers['X-MOLTIN-CUSTOMER-TOKEN'] = token
            }

            fetch(''.concat(config.protocol, '://').concat(config.host, '/').concat(config.version, '/').concat(uri), {
              method: method.toUpperCase(),
              headers,
              body: buildRequestBody(body),
            }).then(parseJSON).then((response) => {
              if (response.ok) {
                resolve(response.json)
                return
              }

              reject(response.json)
            }).catch(error => reject(error))
          }

          if (!credentials || !credentials.access_token || credentials.client_id !== config.client_id || Math.floor(Date.now() / 1000) >= credentials.expires) {
            return _this.authenticate().then(() => req(JSON.parse(storage.get('moltinCredentials')))).catch(error => reject(error))
          }

          return req(credentials)
        }))
        if (instance) resetProps(instance)
        return promise
      },
    }])

    return RequestFactory
  }())

  const BaseExtend =
  /* #__PURE__ */
  (function () {
    function BaseExtend(config) {
      _classCallCheck(this, BaseExtend)

      this.request = new RequestFactory(config)
      this.config = config
    }

    _createClass(BaseExtend, [{
      key: 'All',
      value: function All() {
        const token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null
        const { includes } = this
        const { sort } = this
        const { limit } = this
        const { offset } = this
        const { filter } = this
        this.call = this.request.send(buildURL(this.endpoint, {
          includes,
          sort,
          limit,
          offset,
          filter,
        }), 'GET', undefined, token, this)
        return this.call
      },
    }, {
      key: 'Get',
      value: function Get(id) {
        const token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null
        this.call = this.request.send(buildURL(''.concat(this.endpoint, '/').concat(id), {
          includes: this.includes,
        }), 'GET', undefined, token, this)
        return this.call
      },
    }, {
      key: 'Filter',
      value: function Filter(filter) {
        this.filter = filter
        return this
      },
    }, {
      key: 'Limit',
      value: function Limit(value) {
        this.limit = value
        return this
      },
    }, {
      key: 'Offset',
      value: function Offset(value) {
        this.offset = value
        return this
      },
    }, {
      key: 'Sort',
      value: function Sort(value) {
        this.sort = value
        return this
      },
    }, {
      key: 'With',
      value: function With(includes) {
        if (includes) this.includes = includes.toString().toLowerCase()
        return this
      },
    }])

    return BaseExtend
  }())

  const CRUDExtend =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(CRUDExtend, _BaseExtend)

    function CRUDExtend() {
      _classCallCheck(this, CRUDExtend)

      return _possibleConstructorReturn(this, _getPrototypeOf(CRUDExtend).apply(this, arguments))
    }

    _createClass(CRUDExtend, [{
      key: 'Create',
      value: function Create(body) {
        return this.request.send(this.endpoint, 'POST', _objectSpread({}, body, {
          type: singularize(this.endpoint),
        }))
      },
    }, {
      key: 'Delete',
      value: function Delete(id) {
        return this.request.send(''.concat(this.endpoint, '/').concat(id), 'DELETE')
      },
    }, {
      key: 'Update',
      value: function Update(id, body) {
        return this.request.send(''.concat(this.endpoint, '/').concat(id), 'PUT', _objectSpread({}, body, {
          type: singularize(this.endpoint),
        }))
      },
    }])

    return CRUDExtend
  }(BaseExtend))

  const ProductsEndpoint =
  /* #__PURE__ */
  (function (_CRUDExtend) {
    _inherits(ProductsEndpoint, _CRUDExtend)

    function ProductsEndpoint(endpoint) {
      let _this

      _classCallCheck(this, ProductsEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ProductsEndpoint).call(this, endpoint))
      _this.endpoint = 'products'
      return _this
    }

    _createClass(ProductsEndpoint, [{
      key: 'CreateRelationships',
      value: function CreateRelationships(id, type, resources) {
        const body = buildRelationshipData(type, resources)
        const parsedType = formatUrlResource(type)
        return this.request.send(''.concat(this.endpoint, '/').concat(id, '/relationships/').concat(parsedType), 'POST', body)
      },
    }, {
      key: 'DeleteRelationships',
      value: function DeleteRelationships(id, type, resources) {
        const body = buildRelationshipData(type, resources)
        const parsedType = formatUrlResource(type)
        return this.request.send(''.concat(this.endpoint, '/').concat(id, '/relationships/').concat(parsedType), 'DELETE', body)
      },
    }, {
      key: 'UpdateRelationships',
      value: function UpdateRelationships(id, type) {
        const resources = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null
        const body = buildRelationshipData(type, resources)
        const parsedType = formatUrlResource(type)
        return this.request.send(''.concat(this.endpoint, '/').concat(id, '/relationships/').concat(parsedType), 'PUT', body)
      },
    }])

    return ProductsEndpoint
  }(CRUDExtend))

  const CurrenciesEndpoint =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(CurrenciesEndpoint, _BaseExtend)

    function CurrenciesEndpoint(config) {
      let _this

      _classCallCheck(this, CurrenciesEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CurrenciesEndpoint).call(this, config))
      _this.endpoint = 'currencies'
      _this.storage = config.storage
      return _this
    }

    _createClass(CurrenciesEndpoint, [{
      key: 'Create',
      value: function Create(body) {
        return this.request.send(''.concat(this.endpoint), 'POST', body)
      },
    }, {
      key: 'Delete',
      value: function Delete(id) {
        return this.request.send(''.concat(this.endpoint, '/').concat(id), 'DELETE')
      },
    }, {
      key: 'Update',
      value: function Update(id, body) {
        return this.request.send(''.concat(this.endpoint, '/').concat(id), 'PUT', body)
      },
    }, {
      key: 'Set',
      value: function Set(currency) {
        const { config } = this
        const { storage } = this
        storage.set('mcurrency', currency)
        config.currency = currency
        const promise = new Promise(((resolve, reject) => {
          const request = storage.get('mcurrency')

          try {
            resolve(request)
          } catch (err) {
            reject(new Error(err))
          }
        }))
        return promise
      },
    }, {
      key: 'Active',
      value: function Active() {
        const { storage } = this
        const promise = new Promise(((resolve, reject) => {
          const request = storage.get('mcurrency')

          try {
            resolve(request)
          } catch (err) {
            reject(new Error(err))
          }
        }))
        return promise
      },
    }])

    return CurrenciesEndpoint
  }(BaseExtend))

  const BrandsEndpoint =
  /* #__PURE__ */
  (function (_CRUDExtend) {
    _inherits(BrandsEndpoint, _CRUDExtend)

    function BrandsEndpoint(endpoint) {
      let _this

      _classCallCheck(this, BrandsEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(BrandsEndpoint).call(this, endpoint))
      _this.endpoint = 'brands'
      return _this
    }

    return BrandsEndpoint
  }(CRUDExtend))

  const CartEndpoint =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(CartEndpoint, _BaseExtend)

    function CartEndpoint(request, id) {
      let _this

      _classCallCheck(this, CartEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CartEndpoint).apply(this, arguments))
      _this.request = request
      _this.cartId = id
      _this.endpoint = 'carts'
      return _this
    }

    _createClass(CartEndpoint, [{
      key: 'Get',
      value: function Get() {
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId), 'GET')
      },
    }, {
      key: 'Items',
      value: function Items() {
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId, '/items'), 'GET')
      },
    }, {
      key: 'AddProduct',
      value: function AddProduct(productId) {
        const quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1
        const data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
        const body = buildCartItemData(productId, quantity)
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId, '/items'), 'POST', _objectSpread({}, body, data))
      },
    }, {
      key: 'AddCustomItem',
      value: function AddCustomItem(body) {
        const itemObject = Object.assign(body, {
          type: 'custom_item',
        })
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId, '/items'), 'POST', itemObject)
      },
    }, {
      key: 'AddPromotion',
      value: function AddPromotion(code) {
        const body = buildCartItemData(code, null, 'promotion_item')
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId, '/items'), 'POST', body)
      },
    }, {
      key: 'RemoveItem',
      value: function RemoveItem(itemId) {
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId, '/items/').concat(itemId), 'DELETE')
      },
    }, {
      key: 'UpdateItemQuantity',
      value: function UpdateItemQuantity(itemId, quantity) {
        const body = buildCartItemData(itemId, quantity)
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId, '/items/').concat(itemId), 'PUT', body)
      },
    }, {
      key: 'Checkout',
      value: function Checkout(customer, billing_address) {
        const shipping_address = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : billing_address
        const body = buildCartCheckoutData(customer, billing_address, shipping_address)
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId, '/checkout'), 'POST', body)
      },
    }, {
      key: 'Delete',
      value: function Delete() {
        return this.request.send(''.concat(this.endpoint, '/').concat(this.cartId), 'DELETE')
      },
    }])

    return CartEndpoint
  }(BaseExtend))

  const CategoriesEndpoint =
  /* #__PURE__ */
  (function (_CRUDExtend) {
    _inherits(CategoriesEndpoint, _CRUDExtend)

    function CategoriesEndpoint(endpoint) {
      let _this

      _classCallCheck(this, CategoriesEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CategoriesEndpoint).call(this, endpoint))
      _this.endpoint = 'categories'
      return _this
    }

    _createClass(CategoriesEndpoint, [{
      key: 'Tree',
      value: function Tree() {
        return this.request.send(''.concat(this.endpoint, '/tree'), 'GET')
      },
    }])

    return CategoriesEndpoint
  }(CRUDExtend))

  const CollectionsEndpoint =
  /* #__PURE__ */
  (function (_CRUDExtend) {
    _inherits(CollectionsEndpoint, _CRUDExtend)

    function CollectionsEndpoint(endpoint) {
      let _this

      _classCallCheck(this, CollectionsEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CollectionsEndpoint).call(this, endpoint))
      _this.endpoint = 'collections'
      return _this
    }

    return CollectionsEndpoint
  }(CRUDExtend))

  const OrdersEndpoint =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(OrdersEndpoint, _BaseExtend)

    function OrdersEndpoint(endpoint) {
      let _this

      _classCallCheck(this, OrdersEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(OrdersEndpoint).call(this, endpoint))
      _this.endpoint = 'orders'
      return _this
    }

    _createClass(OrdersEndpoint, [{
      key: 'Items',
      value: function Items(id) {
        return this.request.send(''.concat(this.endpoint, '/').concat(id, '/items'), 'GET')
      },
    }, {
      key: 'Payment',
      value: function Payment(id, body) {
        return this.request.send(''.concat(this.endpoint, '/').concat(id, '/payments'), 'POST', body)
      },
    }, {
      key: 'Transactions',
      value: function Transactions(id) {
        console.warn("DeprecationWarning: 'Order.Transactions(id)' will soon be deprecated. It's recommended you use Transactions class directly to get all, capture and refund transactions.")
        return this.request.send(''.concat(this.endpoint, '/').concat(id, '/transactions'), 'GET')
      },
    }, {
      key: 'Update',
      value: function Update(id, body) {
        return this.request.send(''.concat(this.endpoint, '/').concat(id), 'PUT', _objectSpread({}, body, {
          type: 'order',
        }))
      },
    }])

    return OrdersEndpoint
  }(BaseExtend))

  const GatewaysEndpoint =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(GatewaysEndpoint, _BaseExtend)

    function GatewaysEndpoint(endpoint) {
      let _this

      _classCallCheck(this, GatewaysEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(GatewaysEndpoint).call(this, endpoint))
      _this.endpoint = 'gateways'
      return _this
    }

    _createClass(GatewaysEndpoint, [{
      key: 'Update',
      value: function Update(slug, body) {
        return this.request.send(''.concat(this.endpoint, '/').concat(slug), 'PUT', body)
      },
    }, {
      key: 'Enabled',
      value: function Enabled(slug, enabled) {
        return this.request.send(''.concat(this.endpoint, '/').concat(slug), 'PUT', {
          type: 'gateway',
          enabled,
        })
      },
    }])

    return GatewaysEndpoint
  }(BaseExtend))

  const CustomersEndpoint =
  /* #__PURE__ */
  (function (_CRUDExtend) {
    _inherits(CustomersEndpoint, _CRUDExtend)

    function CustomersEndpoint(endpoint) {
      let _this

      _classCallCheck(this, CustomersEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(CustomersEndpoint).call(this, endpoint))
      _this.endpoint = 'customers'
      return _this
    }

    _createClass(CustomersEndpoint, [{
      key: 'Token',
      value: function Token(email, password) {
        return this.request.send(''.concat(this.endpoint, '/tokens'), 'POST', {
          email,
          password,
          type: 'token',
        })
      },
    }])

    return CustomersEndpoint
  }(CRUDExtend))

  const InventoriesEndpoint =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(InventoriesEndpoint, _BaseExtend)

    function InventoriesEndpoint(endpoint) {
      let _this

      _classCallCheck(this, InventoriesEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(InventoriesEndpoint).call(this, endpoint))
      _this.endpoint = 'inventories'
      return _this
    }

    _createClass(InventoriesEndpoint, [{
      key: 'Get',
      value: function Get(productId) {
        return this.request.send(''.concat(this.endpoint, '/').concat(productId), 'GET')
      },
    }, {
      key: 'IncrementStock',
      value: function IncrementStock(productId, quantity) {
        return this.request.send(''.concat(this.endpoint, '/').concat(productId, '/transactions'), 'POST', {
          action: 'increment',
          quantity,
          type: 'stock-transaction',
        })
      },
    }, {
      key: 'DecrementStock',
      value: function DecrementStock(productId, quantity) {
        return this.request.send(''.concat(this.endpoint, '/').concat(productId, '/transactions'), 'POST', {
          action: 'decrement',
          quantity,
          type: 'stock-transaction',
        })
      },
    }, {
      key: 'AllocateStock',
      value: function AllocateStock(productId, quantity) {
        return this.request.send(''.concat(this.endpoint, '/').concat(productId, '/transactions'), 'POST', {
          action: 'allocate',
          quantity,
          type: 'stock-transaction',
        })
      },
    }, {
      key: 'DeallocateStock',
      value: function DeallocateStock(productId, quantity) {
        return this.request.send(''.concat(this.endpoint, '/').concat(productId, '/transactions'), 'POST', {
          action: 'deallocate',
          quantity,
          type: 'stock-transaction',
        })
      },
    }, {
      key: 'GetTransactions',
      value: function GetTransactions(productId) {
        return this.request.send(''.concat(this.endpoint, '/').concat(productId, '/transactions'), 'GET')
      },
    }])

    return InventoriesEndpoint
  }(BaseExtend))

  const Jobs =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(Jobs, _BaseExtend)

    function Jobs(endpoint) {
      let _this

      _classCallCheck(this, Jobs)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Jobs).call(this, endpoint))
      _this.endpoint = 'jobs'
      return _this
    }

    _createClass(Jobs, [{
      key: 'Create',
      value: function Create(body) {
        return this.request.send(this.endpoint, 'POST', body)
      },
    }])

    return Jobs
  }(BaseExtend))

  const FlowsEndpoint =
  /* #__PURE__ */
  (function (_CRUDExtend) {
    _inherits(FlowsEndpoint, _CRUDExtend)

    function FlowsEndpoint(endpoint) {
      let _this

      _classCallCheck(this, FlowsEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(FlowsEndpoint).call(this, endpoint))
      _this.endpoint = 'flows'
      return _this
    }

    _createClass(FlowsEndpoint, [{
      key: 'GetEntries',
      value: function GetEntries(slug) {
        return this.request.send(''.concat(this.endpoint, '/').concat(slug, '/entries'), 'GET')
      },
    }, {
      key: 'GetEntry',
      value: function GetEntry(slug, entryId) {
        return this.request.send(''.concat(this.endpoint, '/').concat(slug, '/entries/').concat(entryId), 'GET')
      },
    }, {
      key: 'CreateEntry',
      value: function CreateEntry(slug, body) {
        return this.request.send(''.concat(this.endpoint, '/').concat(slug, '/entries'), 'POST', _objectSpread({}, body, {
          type: 'entry',
        }))
      },
    }, {
      key: 'UpdateEntry',
      value: function UpdateEntry(slug, entryId, body) {
        return this.request.send(''.concat(this.endpoint, '/').concat(slug, '/entries/').concat(entryId), 'PUT', _objectSpread({}, body, {
          type: 'entry',
        }))
      },
    }, {
      key: 'DeleteEntry',
      value: function DeleteEntry(slug, entryId) {
        return this.request.send(''.concat(this.endpoint, '/').concat(slug, '/entries/').concat(entryId), 'DELETE')
      },
    }])

    return FlowsEndpoint
  }(CRUDExtend))

  const FieldsEndpoint =
  /* #__PURE__ */
  (function (_CRUDExtend) {
    _inherits(FieldsEndpoint, _CRUDExtend)

    function FieldsEndpoint(endpoint) {
      let _this

      _classCallCheck(this, FieldsEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(FieldsEndpoint).call(this, endpoint))
      _this.endpoint = 'fields'
      return _this
    }

    return FieldsEndpoint
  }(CRUDExtend))

  const Files =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(Files, _BaseExtend)

    function Files(endpoint) {
      let _this

      _classCallCheck(this, Files)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Files).call(this, endpoint))
      _this.endpoint = 'files'
      return _this
    }

    return Files
  }(BaseExtend))

  const AddressesEndpoint =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(AddressesEndpoint, _BaseExtend)

    function AddressesEndpoint(endpoint) {
      let _this

      _classCallCheck(this, AddressesEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(AddressesEndpoint).call(this, endpoint))
      _this.endpoint = 'addresses'
      return _this
    }

    _createClass(AddressesEndpoint, [{
      key: 'All',
      value: function All(_ref) {
        const { customer } = _ref
        const _ref$token = _ref.token
        const token = _ref$token === void 0 ? null : _ref$token
        return this.request.send('customers/'.concat(customer, '/').concat(this.endpoint), 'GET', undefined, token)
      },
    }, {
      key: 'Get',
      value: function Get(_ref2) {
        const { customer } = _ref2
        const { address } = _ref2
        const _ref2$token = _ref2.token
        const token = _ref2$token === void 0 ? null : _ref2$token
        return this.request.send('customers/'.concat(customer, '/').concat(this.endpoint, '/').concat(address), 'GET', undefined, token)
      },
    }, {
      key: 'Create',
      value: function Create(_ref3) {
        const { customer } = _ref3
        const { body } = _ref3
        const _ref3$token = _ref3.token
        const token = _ref3$token === void 0 ? null : _ref3$token
        return this.request.send('customers/'.concat(customer, '/').concat(this.endpoint), 'POST', _objectSpread({}, body, {
          type: singularize(this.endpoint),
        }), token)
      },
    }, {
      key: 'Delete',
      value: function Delete(_ref4) {
        const { customer } = _ref4
        const { address } = _ref4
        const _ref4$token = _ref4.token
        const token = _ref4$token === void 0 ? null : _ref4$token
        return this.request.send('customers/'.concat(customer, '/').concat(this.endpoint, '/').concat(address), 'DELETE', undefined, token)
      },
    }, {
      key: 'Update',
      value: function Update(_ref5) {
        const { customer } = _ref5
        const { address } = _ref5
        const { body } = _ref5
        const _ref5$token = _ref5.token
        const token = _ref5$token === void 0 ? null : _ref5$token
        return this.request.send('customers/'.concat(customer, '/').concat(this.endpoint, '/').concat(address), 'PUT', _objectSpread({}, body, {
          type: singularize(this.endpoint),
        }), token)
      },
    }])

    return AddressesEndpoint
  }(BaseExtend))

  const TransactionsEndpoint =
  /* #__PURE__ */
  (function (_BaseExtend) {
    _inherits(TransactionsEndpoint, _BaseExtend)

    function TransactionsEndpoint(endpoint) {
      let _this

      _classCallCheck(this, TransactionsEndpoint)

      _this = _possibleConstructorReturn(this, _getPrototypeOf(TransactionsEndpoint).call(this, endpoint))
      _this.endpoint = 'transactions'
      return _this
    }

    _createClass(TransactionsEndpoint, [{
      key: 'All',
      value: function All(_ref) {
        const { order } = _ref
        return this.request.send('orders/'.concat(order, '/').concat(this.endpoint), 'GET')
      },
    }, {
      key: 'Capture',
      value: function Capture(_ref2) {
        const { order } = _ref2
        const { transaction } = _ref2
        return this.request.send('orders/'.concat(order, '/transactions/').concat(transaction, '/capture'), 'POST')
      },
    }, {
      key: 'Refund',
      value: function Refund(_ref3) {
        const { order } = _ref3
        const { transaction } = _ref3
        return this.request.send('orders/'.concat(order, '/transactions/').concat(transaction, '/refund'), 'POST')
      },
    }])

    return TransactionsEndpoint
  }(BaseExtend))

  const MemoryStorageFactory =
  /* #__PURE__ */
  (function () {
    function MemoryStorageFactory() {
      _classCallCheck(this, MemoryStorageFactory)

      this.state = new Map()
    }

    _createClass(MemoryStorageFactory, [{
      key: 'set',
      value: function set(key, value) {
        this.state.set(key, value)
      },
    }, {
      key: 'get',
      value: function get(key) {
        return this.state.get(key) || null
      },
    }, {
      key: 'delete',
      value: function _delete(key) {
        this.state.delete(key)
      },
    }])

    return MemoryStorageFactory
  }())

  const Moltin =
  /* #__PURE__ */
  (function () {
    function Moltin(config) {
      _classCallCheck(this, Moltin)

      this.config = config
      this.cartId = cartIdentifier(config.storage)
      this.request = new RequestFactory(config)
      this.storage = config.storage
      this.Products = new ProductsEndpoint(config)
      this.Currencies = new CurrenciesEndpoint(config)
      this.Brands = new BrandsEndpoint(config)
      this.Categories = new CategoriesEndpoint(config)
      this.Collections = new CollectionsEndpoint(config)
      this.Orders = new OrdersEndpoint(config)
      this.Gateways = new GatewaysEndpoint(config)
      this.Customers = new CustomersEndpoint(config)
      this.Inventories = new InventoriesEndpoint(config)
      this.Jobs = new Jobs(config)
      this.Files = new Files(config)
      this.Flows = new FlowsEndpoint(config)
      this.Fields = new FieldsEndpoint(config)
      this.Addresses = new AddressesEndpoint(config)
      this.Transactions = new TransactionsEndpoint(config)
    } // Expose `Cart` class on Moltin class


    _createClass(Moltin, [{
      key: 'Cart',
      value: function Cart() {
        const id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.cartId
        return new CartEndpoint(this.request, id)
      }, // Expose `authenticate` function on the Moltin class

    }, {
      key: 'Authenticate',
      value: function Authenticate() {
        return this.request.authenticate()
      },
    }])

    return Moltin
  }()) // Export a function to instantiate the Moltin class

  const gateway = function gateway(config) {
    return new Moltin(new Config(config))
  }

  exports.default = Moltin
  exports.gateway = gateway
  exports.MemoryStorageFactory = MemoryStorageFactory
  exports.LocalStorageFactory = LocalStorageFactory

  Object.defineProperty(exports, '__esModule', { value: true })
})))
