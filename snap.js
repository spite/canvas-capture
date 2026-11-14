(() => {
  // Context types that can be read at any time; WebGL counts only because preserve.js forces preserveDrawingBuffer.
  const READABLE = new Set(["2d", "bitmaprenderer", "webgl", "experimental-webgl", "webgl2"]);
  const types = window[Symbol.for("canvas-capture")];

  function deepQuerySelectorAll(root, selector) {
    const res = root.querySelectorAll(selector);
    const nodes = [...root.querySelectorAll("*")].filter((n) => !!n.shadowRoot);
    const res2 = nodes.map((n) => deepQuerySelectorAll(n.shadowRoot, selector));
    return [...res].concat(...res2);
  }

  function encode(c) {
    return new Promise((resolve) => {
      try {
        c.toBlob((blob) => {
          if (!blob) {
            console.warn("CanvasCapture: could not encode canvas", c);
            return resolve(null);
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("CanvasCapture: skipped canvas", c, e);
        resolve(null);
      }
    });
  }

  const canvases = deepQuerySelectorAll(document, "canvas").filter(
    (c) => c.width && c.height && !c.hasAttribute("skip-capture")
  );

  // toBlob() is called synchronously for every canvas before any await, so all are read in the same frame.
  const captureAll = () => Promise.all(canvases.map(encode)).then((urls) => urls.filter(Boolean));

  if (!canvases.length) return Promise.resolve([]);
  if (types && canvases.every((c) => READABLE.has(types.get(c)))) return captureAll();

  // Otherwise capture right after the page's next frame callback, before the buffer is cleared.
  return new Promise((resolve) => {
    const rAF = window.requestAnimationFrame;
    let done = false;

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(fallback);
      if (window.requestAnimationFrame === hook) window.requestAnimationFrame = rAF;
      resolve(captureAll());
    }

    function hook(f) {
      window.requestAnimationFrame = rAF;
      return rAF.call(window, (t) => {
        try {
          f(t);
        } finally {
          finish();
        }
      });
    }

    window.requestAnimationFrame = hook;
    // Pages that never call rAF (static canvases) still get captured.
    const fallback = setTimeout(finish, 250);
  });
})();
