
export const findObjectSection = (object, sectionKey) => {
  let result = null

  for (const key of Object.keys(object)) {
    if (key === sectionKey) {
      result = object[key]
    } else if (object[key].children) {
      result = findObjectSection(object[key].children, sectionKey)
    }

    if (result) {
      return result
    }
  }
}


export const collectNameIds = (system) => {
  var toReturn = [];

  for (const i in system) {
    if (!system.hasOwnProperty(i)) continue;
    // Dive inside celestial object details
    if ((typeof system[i]) == 'object' && system[i] !== null) {

      if (system[i].nameId) {
        toReturn.push(system[i].nameId)
      }
      if (system[i].children) {
        toReturn = [...toReturn, ...collectNameIds(system[i].children)]
      }
    }

  }

  return toReturn;
}

export const flattenObject = (ob) => {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}