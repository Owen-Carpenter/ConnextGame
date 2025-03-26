import json
from collections import defaultdict

def load_binomials(filename):
    with open(filename, 'r') as f:
        return json.load(f)

def save_binomials(binomials, filename):
    with open(filename, 'w') as f:
        json.dump(binomials, f, indent=2)
    print(f"✅ Saved {len(binomials)} pruned binomial expressions to {filename}")

def prune_unlinked_binomials(binomials):
    # Map each word to the number of times it appears in a pair
    word_links = defaultdict(int)
    for w1, w2 in binomials:
        word_links[w1] += 1
        word_links[w2] += 1

    # Recount links excluding the pair itself
    pruned = []
    for w1, w2 in binomials:
        if word_links[w1] > 1 or word_links[w2] > 1:
            pruned.append([w1, w2])

    return pruned

if __name__ == "__main__":
    input_file = "openwebtext_binomials.json"
    output_file = "linked_binomials.json"

    binomials = load_binomials(input_file)
    pruned_binomials = prune_unlinked_binomials(binomials)
    save_binomials(pruned_binomials, output_file)
