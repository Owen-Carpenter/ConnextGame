import json
import os
import sys

# Use absolute path for the binomials file
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
other_binomials_file = os.path.join(project_root, 'openwebtext_binomials.json')

print(f"Checking other binomials file: {other_binomials_file}")
print(f"File exists: {os.path.exists(other_binomials_file)}")

try:
    with open(other_binomials_file, 'r') as f:
        data = json.load(f)
        print(f"Loaded {len(data)} binomial pairs")
        
        # Convert to a format we can easily search
        pairs_dict = {}
        for pair in data:
            w1, w2 = pair
            pairs_dict.setdefault(w1, set()).add(w2)
            pairs_dict.setdefault(w2, set()).add(w1)
        
        # Check if fallback words exist
        fallback_words = ["key", "chain", "fence", "yard", "garden", "flower", "bee", "honey", "sweet", "cake", "party", "friend", "trust"]
        print("\nChecking if fallback words are in the other binomials file:")
        for word in fallback_words:
            found = word in pairs_dict
            connections = list(pairs_dict.get(word, [])) if found else []
            print(f"'{word}': {'✓' if found else '✗'} - Connects to: {connections}")
            
        # Check if fallback pairs exist
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
        
        print("\nChecking if fallback pairs exist in the other binomials file:")
        for w1, w2 in fallback_pairs:
            direct = w2 in pairs_dict.get(w1, [])
            reverse = w1 in pairs_dict.get(w2, [])
            print(f"'{w1}' -> '{w2}': {'✓' if direct else '✗'} (reverse: {'✓' if reverse else '✗'})")
        
except Exception as e:
    print(f"Error reading other binomials file: {str(e)}") 