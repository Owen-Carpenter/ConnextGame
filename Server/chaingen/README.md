# Word Chain Generation System

This system generates word pairs for the ConnextGame application. It uses Python to analyze text and create linked binomials (word pairs that commonly appear together), which are then used to create word chains for different game modes.

## Setup Instructions

### Prerequisites

- Python 3.7+
- Node.js
- Required Python packages: `nltk`, `datasets`, `tqdm`

### Initial Setup

1. Install required Python packages:
   ```
   pip install nltk datasets tqdm
   ```

2. Generate binomials from text data:
   ```
   python createbinomials.py
   ```
   This will create `openwebtext_binomials.json`. This process may take some time as it processes text data.

3. Prune unlinked binomials:
   ```
   python pruneunlinked.py
   ```
   This creates `linked_binomials.json`, which contains only binomials that can form chains.

### Usage in Node.js Application

The `wordChainWrapper.js` provides a simple interface to generate word chains for games:

```javascript
import { generateWordChain } from '../chaingen/wordChainWrapper.js';

// For classic game mode (10 pairs)
const classicChain = await generateWordChain('classic');

// For infinite game mode (100 pairs)
const infiniteChain = await generateWordChain('infinite');

// Force refresh the cache
const freshChain = await generateWordChain('classic', true);
```

### API Endpoints

The system provides the following API endpoints for the frontend:

- `GET /chain/classic` - Get a word chain for classic mode (10 pairs)
- `GET /chain/infinite` - Get a word chain for infinite mode (100 pairs)
- `GET /chain/:gameType?refresh=true` - Get a fresh word chain for the specified game type

### React Hook Usage

In your React components, use the `useWordChain` hook:

```jsx
import useWordChain from '../hooks/useWordChain';

function GameComponent() {
  const { wordChain, loading, error, refresh, isReady } = useWordChain('classic');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {wordChain.map(([word1, word2], index) => (
        <div key={index}>
          {word1} - {word2}
        </div>
      ))}
      <button onClick={refresh}>New Chain</button>
    </div>
  );
}
```

## Customization

- Adjust chain lengths in `wordChainWrapper.js`
- Modify cache TTL settings for different game types
- Customize word selection algorithms in the Python scripts 