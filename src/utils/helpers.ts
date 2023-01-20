/**
 * Convert rotaion period (in days) to radians per second
 * @param { Number } rotation_period
 * @returns { Number } radiansPerSecond
 */
export function convertRotationPerDayToRadians(rotation_period: number) {
  const minutesInDay = 24 * 60
  const fullRevolutionInMinutes = rotation_period * minutesInDay
  const degreesPerMinute = 1 * 360 / fullRevolutionInMinutes
  const radiansPerMinute = degreesPerMinute * (2 * Math.PI)
  const radiansPerSecond = radiansPerMinute / 60;
  return radiansPerSecond
}

/**
 * Formula adjusted by texture map wrapping offset
 * the x-axis goes through long,lat (0,0), so longitude 0 meets the equator;
 * the y-axis goes through (0,90);
 * and the z-axis goes through the poles.
 *   x = R * cos(lat) * cos(lon)
 *   y = R * cos(lat) * sin(lon)
 *   z = R *sin(lat)
 * @param {*} lat
 * @param {*} lng
 * @returns
 */
export function calcPosFromLatLngRad(lat: number, lng: number, radius: number) {
  // divide angle by 180deg and multiplay by Math.PI to get radians
  const phi = (92-lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -((radius) * Math.sin(phi) * Math.cos(theta));
  const y = ((radius) * Math.sin(phi) * Math.sin(theta));
  const z = ((radius) * Math.cos(phi));

  return { x, y, z };
}

/**
 * Get mesh position and scale
 * @param {Object} mesh
 * @returns {Object} target position and scale
 */
export function getTargetPositionScale(mesh = null) {
  if (!mesh) {
    //default values set to center of Scene
    return {
      p: [0, 0, 0],
      s: 7
    }
  }

  const newPos = {
    p: [
      mesh.position.x,
      mesh.position.y,
      mesh.position.z,
    ],
    s: mesh.scale.z
  }

  return newPos;
}

/**
 * Colorize the console log parts for better visibility
 * @param {String} label
 * @param {String} msg
 * @param {Object|Array|String} rest
 */
export function decorateLog(label = 'empty label', msg = '', rest = '') {
  console.log(
    `%c ${label} %c${msg}`,
    'color: white; background: teal; padding: calc(0.2em + 1px) 0.25em',
    'color: teal; border: 1px solid teal;padding: 0.2em 0.25em',
    rest
  )
}

/**
 * Recursevly apply callback star system class and its qualifying children
 */
export function applyLoopRecursevly(systemClass: any, callback: (child: any) => void ) {
  callback(systemClass)

  if (systemClass.children != null) {
    systemClass.children.forEach((child: any) => applyLoopRecursevly(child, callback))
  }
}