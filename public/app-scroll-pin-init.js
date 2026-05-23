(function () {
  try {
    var top = 62
    var raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--app-min-scroll-top')
      .trim()
    var parsed = parseFloat(raw)
    if (!Number.isNaN(parsed) && parsed > 0)
      top = parsed
    window.scrollTo(0, top)
    document.documentElement.classList.add('app-scroll-pinned')
  }
  catch (_) {}
})()
