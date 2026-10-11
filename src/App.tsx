import React from 'react';
import AdminPanel from './components/AdminPanel';
import PresentationView from './components/PresentationView';
import { decodePresentationFromURL } from './utils/storage';
import { Presentation } from './types';

function App() {
  const [sharedPresentation, setSharedPresentation] = React.useState<Presentation | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    if (shareData) {
      const decoded = decodePresentationFromURL(shareData);
      if (decoded) {
        setSharedPresentation(decoded);
      }
    }
  }, []);

  if (sharedPresentation) {
    return (
      <PresentationView
        presentation={sharedPresentation}
        isShared
      />
    );
  }

  return <AdminPanel />;
}

export default App;
