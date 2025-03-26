import json
import random

def load_binomials(filename):
    with open(filename, 'r') as f:
        return [tuple(pair) for pair in json.load(f)]

def build_word_graph(binomials):
    graph = {}
    for w1, w2 in binomials:
        graph.setdefault(w1, set()).add(w2)
        graph.setdefault(w2, set()).add(w1)
    return graph

def find_chain(graph, current_word, visited, chain, length):
    if len(chain) == length:
        return chain

    for neighbor in graph.get(current_word, []):
        if (current_word, neighbor) not in visited and (neighbor, current_word) not in visited:
            visited.add((current_word, neighbor))
            chain.append((current_word, neighbor))
            result = find_chain(graph, neighbor, visited, chain, length)
            if result:
                return result
            chain.pop()
            visited.remove((current_word, neighbor))
    return None

def generate_word_chain(binomials, length=10):
    graph = build_word_graph(binomials)
    all_words = list(graph.keys())
    random.shuffle(all_words)

    for start_word in all_words:
        chain = []
        visited = set()
        result = find_chain(graph, start_word, visited, chain, length)
        if result:
            return result

    return []  # No chain found

if __name__ == "__main__":
    binomials = load_binomials("linked_binomials.json")
    chain = generate_word_chain(binomials, length=10)

    if chain:
        print("\nGenerated Word Chain:")
        for w1, w2 in chain:
            print(f"{w1} -> {w2}")
    else:
        print("No valid word chain found.")