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

# Try to find a chain
chain_length = 10
print(f"Trying to find a chain of length {chain_length}")

# Print some sample words from the graph
print("Sample words in the graph:")
for i, word in enumerate(random.sample(all_words, min(20, len(all_words)))):
    neighbors = list(graph.get(word, []))
    print(f"{i+1}. '{word}' connects to: {neighbors[:5]} " + ("..." if len(neighbors) > 5 else ""))

# Attempt to find a chain from multiple starting points
found_chain = False
tries = 0
max_tries = 1000

for start_word in random.sample(all_words, min(max_tries, len(all_words))):
    tries += 1
    if tries % 100 == 0:
        print(f"Tried {tries} start words...")
    
    chain = []
    visited = set()
    result = find_chain(graph, start_word, visited, chain, chain_length)
    
    if result:
        found_chain = True
        print(f"\nFound a valid chain starting with '{start_word}' after {tries} tries:")
        for i, (w1, w2) in enumerate(result):
            print(f"{i+1}. {w1} -> {w2}")
        break

if not found_chain:
    print(f"\nCould not find a valid chain after trying {tries} start words")
    
    # Try a shorter chain
    shorter_length = 5
    print(f"\nTrying to find a shorter chain of length {shorter_length}")
    
    for start_word in random.sample(all_words, min(max_tries, len(all_words))):
        tries += 1
        if tries % 100 == 0:
            print(f"Tried {tries} start words...")
        
        chain = []
        visited = set()
        result = find_chain(graph, start_word, visited, chain, shorter_length)
        
        if result:
            found_chain = True
            print(f"\nFound a valid shorter chain starting with '{start_word}':")
            for i, (w1, w2) in enumerate(result):
                print(f"{i+1}. {w1} -> {w2}")
            break

if not found_chain:
    print("\nCould not find any valid chain. The binomials file may not have connected words.") 