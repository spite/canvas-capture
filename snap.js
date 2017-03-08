function snapshot () {

	var canvases = document.querySelectorAll( 'canvas' );

	var rAF = window.requestAnimationFrame;

	window.requestAnimationFrame = function( f ) {

		window.requestAnimationFrame = rAF;

		rAF( function( t ) {

			f( t );

			[].forEach.call( canvases, function( c, id ) {

				c.toBlob( function(blob) {

					var url;
					if( window.webkitURL ) {
						url = window.webkitURL.createObjectURL( blob );
					} else {
						url = URL.createObjectURL(blob);
					}
					var downloadBtn = document.createElement( 'a' );
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


