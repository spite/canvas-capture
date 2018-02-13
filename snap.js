function snapshot () {

  function deepQuerySelectorAll(root, selector) {
    const res = root.querySelectorAll(selector);
    const nodes = [...root.querySelectorAll('*')].filter(n => !!n.shadowRoot);
    const res2 = nodes.map(n => {
      return deepQuerySelectorAll(n.shadowRoot, selector);
    });
    return [...res].concat(...res2);
  }

  const canvases = deepQuerySelectorAll(document, 'canvas' );

  const rAF = window.requestAnimationFrame;

  window.requestAnimationFrame = f => {

    window.requestAnimationFrame = rAF;

    rAF( t => {

      f( t );

      [].forEach.call( canvases, ( c, id ) => {

        c.toBlob( function(blob) {

          const url = URL.createObjectURL(blob);

          const downloadBtn = document.createElement( 'a' );
          downloadBtn.setAttribute( 'download', 'snap-' + id + '-' + performance.now() + '.png' );
          downloadBtn.setAttribute( 'href', url );
          downloadBtn.click();

        });

      });

    })
  }

}

var script = document.createElement( 'script' );
script.type = 'text/javascript';
script.textContent = snapshot.toString() + ';snapshot()';
document.body.appendChild( script );


