import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router';
import GalleryAbout from './GalleryAbout.jsx';
import GalleryNotFound from './GalleryNotFound.jsx';
import GalleryShell from './GalleryShell.jsx';
import PhotoGalleryLayout from './PhotoGalleryLayout.jsx';

// jsdom has no <dialog>.showModal()/close(): mirror browser behaviour (tests only).
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    if (this.hasAttribute('open')) {
      throw new DOMException('The dialog is already open.', 'InvalidStateError');
    }
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    queueMicrotask(() => this.dispatchEvent(new Event('close')));
  };
}

function RouterProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <footer>
      <p data-testid="url">{`${location.pathname}${location.search}`}</p>
      <button type="button" onClick={() => navigate(-1)}>
        Browser back
      </button>
    </footer>
  );
}

export function renderGallery(url) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/gallery" element={<GalleryShell />}>
            <Route index element={<PhotoGalleryLayout />} />
            <Route path="about" element={<GalleryAbout />} />
            <Route path="*" element={<GalleryNotFound />} />
          </Route>
        </Routes>
        <RouterProbe />
      </MemoryRouter>
    </StrictMode>,
  );
}