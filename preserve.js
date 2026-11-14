(() => {
  const KEY = Symbol.for("canvas-capture");
  if (window[KEY]) return;

  const GL_TYPES = new Set(["webgl", "experimental-webgl", "webgl2"]);
  const types = new WeakMap();
  Object.defineProperty(window, KEY, { value: types });

  const getContext = HTMLCanvasElement.prototype.getContext;

  // Keeps the WebGL drawing buffer after compositing so toBlob() works at any time.
  HTMLCanvasElement.prototype.getContext = function getContext_(type, attrs, ...rest) {
    if (GL_TYPES.has(type)) attrs = { ...attrs, preserveDrawingBuffer: true };
    const ctx = getContext.call(this, type, attrs, ...rest);
    if (ctx && !types.has(this)) types.set(this, type);
    return ctx;
  };
  Object.defineProperty(HTMLCanvasElement.prototype.getContext, "name", { value: "getContext" });
})();
