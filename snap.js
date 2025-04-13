// snap.js
function snapshot() {
  function deepQuerySelectorAll(root, selector) {
    const res = root.querySelectorAll(selector);
    const nodes = [...root.querySelectorAll("*")].filter((n) => !!n.shadowRoot);
    const res2 = nodes.map((n) => {
      return deepQuerySelectorAll(n.shadowRoot, selector);
    });
    return [...res].concat(...res2);
  }

  const canvases = deepQuerySelectorAll(document, "canvas");

  [].forEach.call(canvases, (c, id) => {
    c.toBlob(function (blob) {
      const url = URL.createObjectURL(blob);

      const downloadBtn = document.createElement("a");
      downloadBtn.setAttribute(
        "download",
        "snap-" + id + "-" + performance.now() + ".png"
      );
      downloadBtn.setAttribute("href", url);
      document.body.appendChild(downloadBtn); // Append to the document to make click() work
      downloadBtn.click();
      downloadBtn.remove(); // Clean up the temporary element
      URL.revokeObjectURL(url); // Clean up the object URL
    });
  });
}

snapshot();
