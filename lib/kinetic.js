/**
 * Allows smooth kinetic scrolling of the surface
 */
module.exports = kinetic;

function kinetic(getPoint, scroll, settings) {
  if (typeof settings !== 'object') {
    // setting could come as boolean, we should ignore it, and use an object.
    settings = {}
  }

  var minVelocity = (typeof settings.minVelocity === 'number') ? settings.minVelocity : 5
  var amplitude = (typeof settings.amplitude === 'number') ? settings.amplitude : 0.2

  var lastPoint
  var timestamp
  var timeConstant = 342

  var ticker
  var vx, targetX, ax;
  var vy, targetY, ay;

  var raf

  return {
    start: start,
    stop: stop,
    cancel: dispose
  }

  function dispose() {
    lastPoint = getPoint()
    window.clearInterval(ticker)
    window.cancelAnimationFrame(raf)
  }

  function start() {
    lastPoint = getPoint()

    ax = ay = vx = vy = 0
    timestamp = new Date()

    window.clearInterval(ticker)
    window.cancelAnimationFrame(raf)

    // we start polling the point position to accumulate velocity
    // Once we stop(), we will use accumulated velocity to keep scrolling
    // an object.
    ticker = window.setInterval(track, 100);
  }

  function track() {
    var now = Date.now();
    var elapsed = now - timestamp;
    timestamp = now;

    var currentPoint = getPoint()

    var dx = currentPoint.x - lastPoint.x
    var dy = currentPoint.y - lastPoint.y

    lastPoint = currentPoint

    var dt = 1000 / (1 + elapsed)

    // moving average
    vx = 0.8 * dx * dt + 0.2 * vx
    vy = 0.8 * dy * dt + 0.2 * vy
  }

  function stop() {

    track()

    window.clearInterval(ticker);
    window.cancelAnimationFrame(raf)

    var currentPoint = getPoint()

    targetX = currentPoint.x
    targetY = currentPoint.y
    timestamp = Date.now()

    if (vx < -minVelocity || vx > minVelocity) {
      ax = amplitude * vx
      targetX += ax
    }

    if (vy < -minVelocity || vy > minVelocity) {
      ay = amplitude * vy
      targetY += ay
    }

    raf = window.requestAnimationFrame(autoScroll);
  }

  function autoScroll() {
    var elapsed = Date.now() - timestamp

    var moving = false
    var dx = 0
    var dy = 0

    if (ax) {
      dx = -ax * Math.exp(-elapsed / timeConstant)

      if (dx > 0.5 || dx < -0.5) moving = true
      else dx = ax = 0
    }

    if (ay) {
      dy = -ay * Math.exp(-elapsed / timeConstant)

      if (dy > 0.5 || dy < -0.5) moving = true
      else dy = ay = 0
    }

    if (moving) {
      scroll(targetX + dx, targetY + dy)
      raf = window.requestAnimationFrame(autoScroll);
    }
    else{
      if( typeof settings.scrollend == 'function')
        settings.scrollend()
    }
  }

}
