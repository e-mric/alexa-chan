// A shared travelled distance keeps the scenery, asphalt, and tyre tread in sync.
export function advanceRide(state, dt, { paused = false, slow = false } = {}) {
  if (paused) return { ...state, step: 0 };
  const seconds = Math.max(0, Math.min(dt, .05));
  const target = slow ? 2.8 : 12;
  const speed = state.speed + (target - state.speed) * (1 - Math.exp(-seconds * 3));
  const step = speed * seconds;
  return { speed, distance: state.distance + step, step };
}

export function loopRoadPosition(z, step, far = -166, near = 14) {
  const length = near - far;
  return ((z + step - far) % length + length) % length + far;
}

export const ROAD_NEAR = 18;
export const ROAD_FAR = -3200;
export const ROAD_LENGTH = ROAD_NEAR - ROAD_FAR;

// Preserve the straight riding area. Only the distant highway descends and
// bends into the city, continuing well beyond the old visible cutoff.
export function roadProfile(z = 0, viewport) {
  const t = Math.max(0, Math.min(1, (-z - 80) / 520));
  const ease = t * t * (3 - 2 * t);
  const downhill = Math.max(0, -z-80);
  // A gentle continuous descent, without a crest hiding the distant bend.
  const y = -.006*downhill*downhill/(downhill+520);
  if (viewport && ease > 0) {
    const { width, height } = viewport;
    const compact = width <= 800;
    const skyWidth = compact ? height * 1672 / 941 : width;
    // Aim at a point inside the occluding tower, not a viewport-relative
    // horizon: the painted city changes size with the page's aspect ratio.
    const targetX = (width-skyWidth)/2 + skyWidth*.345;
    const tan = Math.tan(55*Math.PI/360);
    const pitch = Math.atan2(2.7,108);
    const slopeY = (y-4.4)/(8-z);
    const slopeX = (2*targetX/width-1+(compact?0:.15))*tan*width/height
      * (Math.cos(pitch)-slopeY*Math.sin(pitch));
    return { x: ease*((compact?0:3.35)+(8-z)*slopeX), y };
  }
  // Keep turning into the left-hand city block. A constant lateral offset
  // projects back toward the central vanishing point, through the tower.
  const beyond = Math.max(0, -z - 260);
  const turn = .11 * beyond * beyond / (beyond + 300);
  return ease === 0 ? { x: 0, y: 0 } : { x: -36 * ease - turn, y };
}

export function wheelRotation(distance, radius) {
  return distance / radius;
}

// Flat-road engine vibration, not suspension bouncing. Applied above the seat
// only, leaving both painted wheel contacts completely fixed.
export function riderVibration(distance, speed) {
  if (speed <= 0) return 0;
  return (Math.sin(distance * 2.4) * .0012 + Math.sin(distance * 4.1) * .0004)
    * Math.min(1, Math.max(0, speed) / 12);
}

// Align both painted tyre contacts to one world-space lane. Translating a
// three-quarter sprite by eye otherwise makes it appear to travel diagonally.
export function alignedRiderX(cameraX, cameraHeight, width, height, scale, rear, front) {
  const rearX = (rear.u - .5) * width * scale;
  const frontX = (front.u - .5) * width * scale;
  const frontHeight = (rear.v - front.v) * height * scale;
  return cameraX + ((cameraHeight - frontHeight) * rearX - cameraHeight * frontX) / frontHeight;
}
