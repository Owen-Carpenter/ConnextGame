import json
import os
import sys
import random
from generatewordchain import load_binomials, build_word_graph, find_chain

# Use absolute path for the binomials file
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
binomials_file = os.path.join(project_root, 'linked_binomials.json')

print(f"Testing chain generation with file: {binomials_file}")
print(f"File exists: {os.path.exists(binomials_file)}")

# Load binomials
binomials = load_binomials(binomials_file)
if not binomials:
    print("No binomials loaded, check the file path")
    sys.exit(1)

print(f"Loaded {len(binomials)} binomial pairs")

# Build graph
graph = build_word_graph(binomials)
all_words = list(graph.keys())
print(f"Graph contains {len(all_words)} unique words")

# Check if suspected fallback words are in our binomials
fallback_words = ["key", "chain", "fence", "yard", "garden", "flower", "bee", "honey", "sweet", "cake", "party", "friend", "trust"]
print("\nChecking if fallback words are in the binomials:")
for word in fallback_words:
    found = word in graph
    connections = list(graph.get(word, [])) if found else []
    print(f"'{word}': {'✓' if found else '✗'} - Connects to: {connections}")

# Check if suspected chain pairs exist in binomials
fallback_pairs = [
    ("key", "chain"),
    ("chain", "fence"),
    ("fence", "yard"),
    ("yard", "garden"),
    ("garden", "flower"),
    ("flower", "bee"),
    ("bee", "honey"),
    ("honey", "sweet"),
    ("sweet", "cake"),
    ("cake", "party"),
    ("party", "friend"),
    ("friend", "trust")
]

print("\nChecking if fallback pairs exist in binomials:")
for w1, w2 in fallback_pairs:
    # Check direct connection
    direct = w2 in graph.get(w1, [])
    # Check reverse connection
    reverse = w1 in graph.get(w2, [])
    print(f"'{w1}' -> '{w2}': {'✓' if direct else '✗'} (reverse: {'✓' if reverse else '✗'})")

# Try to build the same chain as the fallback
print("\nAttempting to build the exact fallback chain from 'key':")
start_word = "key"
chain_length = 8  # key -> chain -> ... -> honey (8 pairs)

if start_word in graph:
    chain = []
    visited = set()
    result = find_chain(graph, start_word, visited, chain, chain_length)
    
    if result:
        print(f"Found a valid chain starting with '{start_word}':")
        for i, (w1, w2) in enumerate(result):
            print(f"{i+1}. {w1} -> {w2}")
    else:
        print(f"Could not find a chain of length {chain_length} starting with '{start_word}'")
else:
    print(f"'{start_word}' is not in the graph")

# Display the entire linked_binomials.json file to verify what we're loading
try:
    with open(binomials_file, 'r') as f:
        data = json.load(f)
        print("\nFirst 10 binomials from file:")
        for i, pair in enumerate(data[:10]):
            print(f"{i+1}. {pair}")
except Exception as e:
    print(f"Error reading binomials file: {str(e)}") 