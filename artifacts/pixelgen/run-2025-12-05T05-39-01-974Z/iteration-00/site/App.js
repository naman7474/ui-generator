import React from 'https://esm.sh/react@18?dev&target=es2018';

export default function App({ sections = [] }) {
  if (sections.length === 0) {
    return React.createElement('div', { className: 'p-8 text-center text-gray-500' }, 
      'No sections loaded. Check console for errors.'
    );
  }
  
  return React.createElement('div', { id: 'app-root' },
    sections.map((Section, i) => 
      React.createElement(Section, { key: i })
    )
  );
}
