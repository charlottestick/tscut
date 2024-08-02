import './bezel.css';
import { ClippingsApi } from './preload';

// Tell typescript that we've extended the interface with our API
declare global {
  interface Window {
    clippings: ClippingsApi;
  }
}

window.clippings.onShowClipping((clipping) => {
  document.getElementById('stack-number')!.textContent = clipping.stackNumber;
  document.getElementById('clipping-content')!.textContent = clipping.content;
  document.getElementById('clipping-source')!.textContent = clipping.source || null;
  document.getElementById('clipping-timestamp')!.textContent =
    clipping.timestamp || null;
});