import './bezel.css';
import { ClippingsApi } from './preload';

// Tell typescript that we've extended the interface with our API
declare global {
  interface Window {
    clippings: ClippingsApi;
  }
}

window.clippings.onShowClipping((clipping) => {
  console.log('showClipping message recieved with: ' + clipping);
  document.getElementById('stack-number').textContent = clipping.stackNumber;
  document.getElementById('clipping-source').textContent = clipping.source;
  document.getElementById('clipping-timestamp').textContent =
    clipping.timestamp;
  document.getElementById('clipping-content').textContent = clipping.content;
});