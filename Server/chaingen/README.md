# Chaingen Module

The `chaingen` module provides word chain generation for the ConnextGame application.

## Setup

1. Install the required Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Generate the binomial word pairs:
   ```
   python createbinomials.py
   ```

3. Prune unlinked binomials to create the final word list:
   ```
   python pruneunlinked.py
   ```

## API Usage

The chaingen functionality is exposed through the server API at:

- `/chaingen/generate` - Generate a word chain
- `/chaingen/binomials` - Generate binomials (admin only)
- `/chaingen/prune` - Prune unlinked binomials (admin only)

## How It Works

1. `createbinomials.py` - Extracts binomial expressions (word pairs that commonly appear together) from text data.
2. `pruneunlinked.py` - Filters out binomials that don't connect to other words in the dataset.
3. `generatewordchain.py` - Creates chains of connected words for the game. 