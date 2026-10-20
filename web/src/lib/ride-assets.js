// Match the scene's existing layout breakpoint; fetch the other atlas only if resized.
export const riderAssetFor = width => width <= 800
  ? '/images/ride-rider-courier-rear.webp'
  : '/images/ride-rider-courier.webp';
