'use strict'

const TYPES = {
  VarChar (length) {
    return {type: TYPES.VarChar, length}
  },
  NVarChar (length) {
    return {type: TYPES.NVarChar, length}
  },
  Text () {
    return {type: TYPES.Text}
  },
  Int () {
    return {type: TYPES.Int}
  },
  BigInt () {
    return {type: TYPES.BigInt}
  },
  TinyInt () {
    return {type: TYPES.TinyInt}
  },
  SmallInt () {
    return {type: TYPES.SmallInt}
  },
  Bit () {
    return {type: TYPES.Bit}
  },
  Float () {
    return {type: TYPES.Float}
  },
  Numeric (precision, scale) {
    return {type: TYPES.Numeric, precision, scale}
  },
  Decimal (precision, scale) {
    return {type: TYPES.Decimal, precision, scale}
  },
  Real () {
    return {type: TYPES.Real}
  },
  Date () {
    return {type: TYPES.Date}
  },
  DateTime () {
    return {type: TYPES.DateTime}
  },
  DateTime2 (scale) {
    return {type: TYPES.DateTime2, scale}
  },
  DateTimeOffset (scale) {
    return {type: TYPES.DateTimeOffset, scale}
  },
  SmallDateTime () {
    return {type: TYPES.SmallDateTime}
  },
  Time (scale) {
    return {type: TYPES.Time, scale}
  },
  UniqueIdentifier () {
    return {type: TYPES.UniqueIdentifier}
  },
  SmallMoney () {
    return {type: TYPES.SmallMoney}
  },
  Money () {
    return {type: TYPES.Money}
  },
  Binary (length) {
    return {type: TYPES.Binary, length}
  },
  VarBinary (length) {
    return {type: TYPES.VarBinary, length}
  },
  Image () {
    return {type: TYPES.Image}
  },
  Xml () {
    return {type: TYPES.Xml}
  },
  Char (length) {
    return {type: TYPES.Char, length}
  },
  NChar (length) {
    return {type: TYPES.NChar, length}
  },
  NText () {
    return {type: TYPES.NText}
  },
  TVP (tvpType) {
    return {type: TYPES.TVP, tvpType}
  },
  UDT () {
    return {type: TYPES.UDT}
  },
  Geography () {
    return {type: TYPES.Geography}
  },
  Geometry () {
    return {type: TYPES.Geometry}
  },
  Variant () {
    return {type: TYPES.Variant}
  }
}

module.exports.TYPES = TYPES
module.exports.DECLARATIONS = {}

const zero = function (value, length) {
  if (length == null) length = 2

  value = String(value)
  if (value.length < length) {
    for (let i = 1; i <= length - value.length; i++) {
      value = `0${value}`
    }
  }
  return value
}

for (const key in TYPES) {
  if (Object.prototype.hasOwnProperty.call(TYPES, key)) {
    const value = TYPES[key]
    value.declaration = key.toLowerCase()
    module.exports.DECLARATIONS[value.declaration] = value;

    ((key, value) => {
      value.inspect = () => `[sql.${key}]`
    })(key, value)
  }
}
const typeDeclarationMap = {
  [TYPES.VarChar] : (type, options) => { return `${type.declaration} (${options.length > 8000 ? 'MAX' : (options.length == null ? 'MAX' : options.length)})` },
  [TYPES.NVarChar] : (type, options) => { return `${type.declaration} (${options.length > 4000 ? 'MAX' : (options.length == null ? 'MAX' : options.length)})` },
  [TYPES.Char] : (type, options) => { return `${type.declaration} (${options.length == null ? 1 : options.length})` },
  [TYPES.Decimal] : (type, options) => { return `${type.declaration} (${options.precision == null ? 18 : options.precision}, ${options.scale == null ? 0 : options.scale})` },
  [TYPES.Time] :  (type, options) => { return `${type.declaration} (${options.scale == null ? 7 : options.scale})` },
  [TYPES.TVP] : (type, options) => { return `${options.tvpType} readonly` }
}
typeDeclarationMap[TYPES.VarBinary] = typeDeclarationMap[TYPES.VarChar]
typeDeclarationMap[TYPES.NChar] = typeDeclarationMap[TYPES.Binary] = typeDeclarationMap[TYPES.Char]
typeDeclarationMap[TYPES.Numeric] = typeDeclarationMap[TYPES.Decimal]
typeDeclarationMap[TYPES.DateTime2] = typeDeclarationMap[TYPES.DateTimeOffset] = typeDeclarationMap[TYPES.Time]

module.exports.declare = (type, options) => {
  const declaration = typeDeclarationMap[type] ? typeDeclarationMap[type](type, options) : type.declaration
  return declaration
}

module.exports.cast = (value, type, options) => {
  if (value == null) {
    return null
  }

  switch (typeof value) {
    case 'string':
      return `N'${value.replace(/'/g, '\'\'')}'`

    case 'number':
      return value

    case 'boolean':
      return value ? 1 : 0

    case 'object':
      if (value instanceof Date) {
        let ns = value.getUTCMilliseconds() / 1000
        if (value.nanosecondDelta != null) {
          ns += value.nanosecondDelta
        }
        const scale = options.scale == null ? 7 : options.scale

        if (scale > 0) {
          ns = String(ns).substr(1, scale + 1)
        } else {
          ns = ''
        }

        return `N'${value.getUTCFullYear()}-${zero(value.getUTCMonth() + 1)}-${zero(value.getUTCDate())} ${zero(value.getUTCHours())}:${zero(value.getUTCMinutes())}:${zero(value.getUTCSeconds())}${ns}'`
      } else if (Buffer.isBuffer(value)) {
        return `0x${value.toString('hex')}`
      }

      return null

    default:
      return null
  }
}
