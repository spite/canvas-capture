# CanvasCapture

A Chrome extension that saves every `<canvas>` on the page as a PNG with one click, including WebGL canvases, canvases inside shadow DOM and canvases in iframes.

## Usage

Click the toolbar button. Each canvas is saved to your downloads folder as `<site>-<date>-<time>-<n>.png`. The badge shows how many images were saved, or `!` if the page can't be captured (for example `chrome://` pages and the Web Store).

Canvases that can't be exported are skipped: empty (0×0) canvases, and canvases tainted by cross-origin images.

To exclude a canvas on your own page, give it a `skip-capture` attribute: `<canvas skip-capture></canvas>`.

## WebGL and the "Preserve WebGL buffers" option

By default a WebGL canvas clears its drawing buffer after every frame is shown, so reading it at an arbitrary moment returns a blank image. CanvasCapture handles this two ways:

- **Preserve WebGL buffers** (on by default). A small script runs before page scripts and forces `preserveDrawingBuffer: true` on every WebGL context, so it can be read at any time. This can make WebGL pages slightly slower. Set it to on for every site, only for chosen sites, or off in the extension's options (right-click the toolbar button → Options). Changes apply when a page is reloaded.
- **Frame timing.** Without the option, for WebGPU canvases, and on pages that were open before the extension was installed, the capture happens right after the page's next animation frame, while the buffer still holds the image. This works for most animated pages; static WebGL pages without the option may still come out blank.

## Permissions

- **Access to all sites:** to run the preserve script before page scripts, and to capture canvases inside cross-origin iframes.
- **Downloads:** to save the images without Chrome's "download multiple files" prompt.
- **Storage:** for the options.

## Install from source

Open `chrome://extensions`, enable Developer mode, click **Load unpacked** and select this folder. Requires Chrome 119 or later.
