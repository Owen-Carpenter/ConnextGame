import json
import random
import sys
import os

# Fallback word chains to ensure we always return something
FALLBACK_CHAINS = {
    "classic": [
        ["start", "dog"],
        ["dog", "house"],
        ["house", "key"],
        ["key", "chain"],
        ["chain", "fence"],
        ["fence", "yard"],
        ["yard", "garden"],
        ["garden", "flower"],
        ["flower", "bee"],
        ["bee", "honey"]
    ],
    "infinite": [
        ["start", "dog"],
        ["dog", "house"],
        ["house", "key"],
        ["key", "chain"],
        ["chain", "fence"],
        ["fence", "yard"],
        ["yard", "garden"],
        ["garden", "flower"],
        ["flower", "bee"],
        ["bee", "honey"],
        ["honey", "sweet"],
        ["sweet", "cake"],
        ["cake", "party"],
        ["party", "friend"],
        ["friend", "trust"]
    ]
}

def load_binomials(filename):
    try:
        if not os.path.exists(filename):
            print(f"Warning: Binomials file {filename} not found", file=sys.stderr)
            return []
            
        with open(filename, 'r') as f:
            return [tuple(pair) for pair in json.load(f)]
    except Exception as e:
        print(f"Error loading binomials: {str(e)}", file=sys.stderr)
        return []

def build_word_graph(binomials):
    graph = {}
    for w1, w2 in binomials:
        graph.setdefault(w1, set()).add(w2)
        graph.setdefault(w2, set()).add(w1)
    return graph

def find_chain(graph, current_word, visited, chain, length, max_depth=1000):
    # Add a depth limit to prevent infinite recursion
    if max_depth <= 0:
        return None
        
    if len(chain) == length:
        return chain

    for neighbor in graph.get(current_word, []):
        if (current_word, neighbor) not in visited and (neighbor, current_word) not in visited:
            visited.add((current_word, neighbor))
            chain.append((current_word, neighbor))
            result = find_chain(graph, neighbor, visited, chain, length, max_depth - 1)
            if result:
                return result
            chain.pop()
            visited.remove((current_word, neighbor))
    return None

def generate_word_chain(binomials, length=10):
    # If no binomials, return fallback
    if not binomials:
        game_type = "classic" if length <= 10 else "infinite"
        return FALLBACK_CHAINS[game_type][:length]
        
    try:
        graph = build_word_graph(binomials)
        all_words = list(graph.keys())
        
        # No words in graph, return fallback
        if not all_words:
            game_type = "classic" if length <= 10 else "infinite"
            return FALLBACK_CHAINS[game_type][:length]
        
        random.shuffle(all_words)

        for start_word in all_words:
            chain = []
            visited = set()
            result = find_chain(graph, start_word, visited, chain, length)
            if result:
                return result

        # No chain found, return fallback
        game_type = "classic" if length <= 10 else "infinite"
        return FALLBACK_CHAINS[game_type][:length]
    except Exception as e:
        print(f"Error in generate_word_chain: {str(e)}", file=sys.stderr)
        game_type = "classic" if length <= 10 else "infinite"
        return FALLBACK_CHAINS[game_type][:length]

if __name__ == "__main__":
    try:
        # Get parameters from command line
        if len(sys.argv) >= 3:
            binomials_file = sys.argv[1]
            chain_length = int(sys.argv[2])
        else:
            binomials_file = "linked_binomials.json"
            chain_length = 10
        
        # Limit chain length to a reasonable value to prevent long processing
        chain_length = min(chain_length, 50)
        
        # Load binomials and generate chain
        binomials = load_binomials(binomials_file)
        chain = generate_word_chain(binomials, length=chain_length)

        # Output the chain as JSON for easier parsing by Node.js
        if chain:
            # Convert tuples to lists for JSON serialization
            json_chain = [[w1, w2] for w1, w2 in chain]
            print(json.dumps(json_chain))
        else:
            # This shouldn't happen with the fallback, but just in case
            game_type = "classic" if chain_length <= 10 else "infinite"
            print(json.dumps(FALLBACK_CHAINS[game_type][:chain_length]))
    except Exception as e:
        # Catch any unexpected errors and still return a valid response
        print(f"Critical error: {str(e)}", file=sys.stderr)
        game_type = "classic" if 'chain_length' in locals() and chain_length <= 10 else "infinite"
        print(json.dumps(FALLBACK_CHAINS[game_type]))
