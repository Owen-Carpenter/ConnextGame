import json
import random
import sys
import os

def load_binomials(filename):
    try:
        print(f"Attempting to load binomials from {filename}", file=sys.stderr)
        if not os.path.exists(filename):
            print(f"Warning: Binomials file {filename} not found", file=sys.stderr)
            return []
            
        with open(filename, 'r') as f:
            binomials = json.load(f)
            print(f"Successfully loaded {len(binomials)} binomial pairs", file=sys.stderr)
            return [tuple(pair) for pair in binomials]
    except Exception as e:
        print(f"Error loading binomials: {str(e)}", file=sys.stderr)
        return []

def build_word_graph(binomials):
    graph = {}
    for w1, w2 in binomials:
        graph.setdefault(w1, set()).add(w2)
        graph.setdefault(w2, set()).add(w1)
    return graph

# List of common, simple words to prioritize - expanded with diverse but accessible categories
COMMON_WORDS = {
    # Animals
    'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'mouse', 'fox', 'bear', 'deer',
    'lion', 'tiger', 'wolf', 'frog', 'snake', 'duck', 'owl', 'pig', 'hen', 'bee',
    
    # Home/Household
    'house', 'home', 'door', 'room', 'bed', 'chair', 'table', 'desk', 'couch', 'sofa',
    'lamp', 'light', 'floor', 'wall', 'roof', 'yard', 'porch', 'deck', 'bath', 'sink',
    'bowl', 'pan', 'pot', 'cup', 'dish', 'fork', 'knife', 'spoon', 'plate', 'glass',
    
    # Food/Drinks
    'food', 'meal', 'bread', 'rice', 'meat', 'fish', 'fruit', 'cake', 'pie', 'soup',
    'milk', 'juice', 'tea', 'beer', 'wine', 'egg', 'salt', 'oil', 'ice', 'snack',
    
    # Travel/Transportation
    'car', 'bus', 'bike', 'road', 'path', 'trip', 'map', 'boat', 'ship', 'train',
    'plane', 'walk', 'run', 'ride', 'drive', 'fly', 'swim', 'park', 'move', 'stop',
    
    # Clothing
    'shoe', 'sock', 'hat', 'coat', 'shirt', 'pants', 'dress', 'skirt', 'suit', 'belt',
    'tie', 'glove', 'scarf', 'boot', 'jean', 'vest', 'ring', 'watch', 'bag', 'wear',
    
    # Nature
    'tree', 'plant', 'flower', 'grass', 'leaf', 'rock', 'stone', 'hill', 'lake', 'sea',
    'sun', 'moon', 'star', 'sky', 'rain', 'snow', 'wind', 'sand', 'earth', 'cloud',
    
    # Colors
    'red', 'blue', 'green', 'gold', 'pink', 'gray', 'white', 'black', 'brown', 'tan',
    
    # Time
    'time', 'year', 'month', 'week', 'day', 'hour', 'night', 'now', 'then', 'date',
    'past', 'clock', 'today', 'soon', 'late', 'early', 'age', 'old', 'new', 'young',
    
    # Everyday actions
    'eat', 'drink', 'sleep', 'wake', 'work', 'play', 'talk', 'sing', 'dance', 'look',
    'see', 'hear', 'touch', 'give', 'take', 'make', 'build', 'read', 'write', 'draw',
    'buy', 'sell', 'pay', 'save', 'spend', 'wash', 'clean', 'cook', 'bake', 'grow',
    
    # Body parts
    'hand', 'foot', 'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'arm', 'leg',
    'hair', 'skin', 'heart', 'bone', 'back', 'neck', 'tooth', 'lip', 'chin', 'brain',
    
    # Relationships
    'mom', 'dad', 'son', 'girl', 'boy', 'baby', 'man', 'woman', 'friend', 'team',
    'club', 'group', 'class', 'life', 'love', 'help', 'care', 'gift', 'visit', 'meet',
    
    # School/Office
    'book', 'page', 'note', 'pen', 'test', 'plan', 'game', 'rule', 'goal', 'task',
    'team', 'boss', 'job', 'work', 'desk', 'file', 'key', 'code', 'test', 'learn',
    
    # Technology
    'phone', 'app', 'web', 'site', 'game', 'mail', 'post', 'text', 'data', 'file',
    'card', 'view', 'news', 'blog', 'chat', 'page', 'link', 'code', 'tech', 'tool',
    
    # Emotions/States
    'love', 'hope', 'fear', 'joy', 'fun', 'sad', 'glad', 'mad', 'calm', 'peace',
    'pain', 'care', 'good', 'bad', 'sick', 'well', 'rest', 'busy', 'free', 'safe'
}

# Define conceptual groups for improved flow
CONCEPT_GROUPS = {
    'animals': {'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'mouse', 'fox', 'bear', 'deer',
               'lion', 'tiger', 'wolf', 'frog', 'snake', 'duck', 'owl', 'pig', 'hen', 'bee'},
    
    'home': {'house', 'home', 'door', 'room', 'bed', 'chair', 'table', 'desk', 'couch', 'sofa',
             'lamp', 'light', 'floor', 'wall', 'roof', 'yard', 'porch', 'deck', 'bath', 'sink'},
    
    'kitchen': {'bowl', 'pan', 'pot', 'cup', 'dish', 'fork', 'knife', 'spoon', 'plate', 'glass',
               'food', 'meal', 'cook', 'bake', 'wash', 'clean', 'eat', 'drink'},
    
    'food': {'food', 'meal', 'bread', 'rice', 'meat', 'fish', 'fruit', 'cake', 'pie', 'soup',
            'egg', 'salt', 'oil', 'ice', 'snack', 'cook', 'bake', 'eat'},
    
    'drinks': {'milk', 'juice', 'tea', 'beer', 'wine', 'water', 'drink', 'cup', 'glass'},
    
    'travel': {'car', 'bus', 'bike', 'road', 'path', 'trip', 'map', 'boat', 'ship', 'train',
              'plane', 'walk', 'run', 'ride', 'drive', 'fly', 'swim', 'park', 'move', 'stop'},
    
    'clothing': {'shoe', 'sock', 'hat', 'coat', 'shirt', 'pants', 'dress', 'skirt', 'suit', 'belt',
                'tie', 'glove', 'scarf', 'boot', 'jean', 'vest', 'ring', 'watch', 'bag', 'wear'},
    
    'nature': {'tree', 'plant', 'flower', 'grass', 'leaf', 'rock', 'stone', 'hill', 'lake', 'sea',
              'sun', 'moon', 'star', 'sky', 'rain', 'snow', 'wind', 'sand', 'earth', 'cloud'},
    
    'colors': {'red', 'blue', 'green', 'gold', 'pink', 'gray', 'white', 'black', 'brown', 'tan'},
    
    'time': {'time', 'year', 'month', 'week', 'day', 'hour', 'night', 'now', 'then', 'date',
            'past', 'clock', 'today', 'soon', 'late', 'early', 'age', 'old', 'new', 'young'},
    
    'actions': {'eat', 'drink', 'sleep', 'wake', 'work', 'play', 'talk', 'sing', 'dance', 'look',
               'see', 'hear', 'touch', 'give', 'take', 'make', 'build', 'read', 'write', 'draw',
               'buy', 'sell', 'pay', 'save', 'spend', 'wash', 'clean', 'cook', 'bake', 'grow'},
    
    'body': {'hand', 'foot', 'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'arm', 'leg',
            'hair', 'skin', 'heart', 'bone', 'back', 'neck', 'tooth', 'lip', 'chin', 'brain'},
    
    'people': {'mom', 'dad', 'son', 'girl', 'boy', 'baby', 'man', 'woman', 'friend', 'team',
              'club', 'group', 'class', 'life', 'love', 'help', 'care', 'gift', 'visit', 'meet'},
    
    'work_school': {'book', 'page', 'note', 'pen', 'test', 'plan', 'game', 'rule', 'goal', 'task',
                   'team', 'boss', 'job', 'work', 'desk', 'file', 'key', 'code', 'test', 'learn'},
    
    'tech': {'phone', 'app', 'web', 'site', 'game', 'mail', 'post', 'text', 'data', 'file',
            'card', 'view', 'news', 'blog', 'chat', 'page', 'link', 'code', 'tech', 'tool'},
    
    'emotions': {'love', 'hope', 'fear', 'joy', 'fun', 'sad', 'glad', 'mad', 'calm', 'peace',
                'pain', 'care', 'good', 'bad', 'sick', 'well', 'rest', 'busy', 'free', 'safe'}
}

def get_concept_group(word):
    """Find which concept group(s) a word belongs to"""
    groups = []
    for group_name, words in CONCEPT_GROUPS.items():
        if word in words:
            groups.append(group_name)
    return groups

def word_difficulty_score(word):
    """
    Calculate a difficulty score for a word:
    - Shorter words are easier
    - Common words are easier
    - Words with simple spelling are easier
    """
    # Start with word length (shorter = easier)
    score = len(word) * 2
    
    # Common words get a bonus
    if word in COMMON_WORDS:
        score -= 5
    
    # Penalize words with complex characters
    complex_chars = set('xzjqvwyk')
    for char in complex_chars:
        if char in word:
            score += 1
    
    return score

def conceptual_flow_score(previous_word, current_word):
    """
    Calculate how naturally current_word follows from previous_word
    based on their conceptual groups
    """
    if not previous_word:
        return 0
        
    previous_groups = get_concept_group(previous_word)
    current_groups = get_concept_group(current_word)
    
    # If they share a group, strong relationship
    if set(previous_groups) & set(current_groups):
        return -10  # Lower score is better
    
    # No shared groups, but both are common words
    if previous_word in COMMON_WORDS and current_word in COMMON_WORDS:
        return -5
        
    # No relationship
    return 0

def find_chain(graph, current_word, visited_words, visited_pairs, chain, length, max_depth=1000, difficulty_target=None):
    # Add a depth limit to prevent infinite recursion
    if max_depth <= 0:
        return None
        
    if len(chain) == length:
        return chain

    # Keep track of used words to prevent cycles and improve flow
    if current_word in visited_words:
        return None

    # Get all neighbors
    neighbors = list(graph.get(current_word, []))
    
    # Shuffle first to avoid getting stuck in the same patterns
    random.shuffle(neighbors)
    
    # Calculate scores for each neighbor based on various factors
    neighbor_scores = []
    for neighbor in neighbors:
        if neighbor in visited_words:
            continue
            
        # Base score is difficulty
        difficulty = word_difficulty_score(neighbor)
        
        # Adjust for conceptual flow from current word
        flow_score = conceptual_flow_score(current_word, neighbor)
        
        # For difficulty progression
        if difficulty_target is not None:
            chain_position = len(chain)
            current_difficulty_target = min(5 + chain_position, difficulty_target)
            # How close to target difficulty (0 is perfect)
            target_diff = abs(difficulty - current_difficulty_target)
        else:
            target_diff = 0
            
        # Lower total score is better
        total_score = difficulty + flow_score + target_diff
        
        neighbor_scores.append((neighbor, total_score))
    
    # Sort by score (lower is better)
    neighbor_scores.sort(key=lambda x: x[1])
    
    # Try neighbors in order of their scores
    for neighbor, _ in neighbor_scores:
        pair = (current_word, neighbor)
        if pair not in visited_pairs and (neighbor, current_word) not in visited_pairs:
            visited_pairs.add(pair)
            # Add current word to visited_words to prevent repeats
            new_visited_words = visited_words.copy()
            new_visited_words.add(current_word)
            
            chain.append(pair)
            result = find_chain(graph, neighbor, new_visited_words, visited_pairs, chain, length, max_depth - 1, difficulty_target)
            if result:
                return result
            chain.pop()
            visited_pairs.remove(pair)
    return None

def find_connected_words(graph, min_chain_length=10):
    """Find good starting words that can form chains."""
    word_scores = []
    for word in graph:
        connections = len(graph.get(word, []))
        difficulty = word_difficulty_score(word)
        concept_groups = get_concept_group(word)
        group_bonus = len(concept_groups) * 3  # More conceptual richness is better
        
        # Basic heuristic: more connections + conceptual richness - difficulty
        score = connections + group_bonus - difficulty
        word_scores.append((word, score))

    # Sort by best scores
    word_scores.sort(key=lambda x: x[1], reverse=True)

    # Filter to words that can form a chain at least `min_chain_length` long
    good_starters = []
    for word, _ in word_scores:
        chain = find_chain(graph, word, set(), set(), [], min_chain_length)
        if chain:
            good_starters.append((word, chain))
        if len(good_starters) >= 5:  # Just return a few good options
            break
    return good_starters


def create_guaranteed_chain(graph, length=10):
    """Creates a guaranteed chain by finding connected word clusters."""
    print("Creating a guaranteed chain...", file=sys.stderr)
    
    # First check if we can find a natural chain
    connected_chain = find_connected_words(graph, length)
    if connected_chain:
        print("Found a naturally connected chain", file=sys.stderr)
        return connected_chain
    
    # If we can't find a natural chain of the desired length,
    # create shorter chains and connect them
    print("Creating chain from multiple shorter segments", file=sys.stderr)
    
    all_words = list(graph.keys())
    if not all_words:
        return []
    
    # Sort words by difficulty
    all_words.sort(key=word_difficulty_score)
    
    # Find several shorter chains
    short_chains = []
    remaining_length = length
    
    while remaining_length > 0 and len(short_chains) < 10:  # Limit to 10 attempts
        # Start with simple words
        start_candidates = all_words[:200]  # From the 200 simplest words
        random.shuffle(start_candidates)
        
        for start_word in start_candidates:
            segment_length = min(3, remaining_length)  # Aim for segments of 3 pairs
            chain = []
            visited_pairs = set()
            visited_words = set()
            result = find_chain(graph, start_word, visited_words, visited_pairs, chain, segment_length)
            
            if result:
                short_chains.append(result)
                remaining_length -= len(result)
                print(f"Found segment {len(short_chains)} with {len(result)} pairs", file=sys.stderr)
                break
    
    # Combine the chains
    combined_chain = []
    for segment in short_chains:
        combined_chain.extend(segment)
    
    if combined_chain:
        print(f"Created chain with {len(combined_chain)} pairs from {len(short_chains)} segments", file=sys.stderr)
    else:
        print("Could not create any chain segments", file=sys.stderr)
    
    return combined_chain

def evaluate_chain_flow(chain):
    """Evaluate how good the conceptual flow is in a chain"""
    if not chain:
        return {"flow": 0, "difficulty": 0, "combined": 0}
    
    flow_score = 0
    prev_word = None
    all_words = []
    
    for w1, w2 in chain:
        # Add both words to our list
        all_words.extend([w1, w2])
        
        # Check flow from previous word to current first word
        if prev_word:
            flow_score += conceptual_flow_score(prev_word, w1)
        
        # Check flow between words in this pair
        flow_score += conceptual_flow_score(w1, w2)
        
        # Remember last word for next iteration
        prev_word = w2
    
    # Add score for word simplicity/difficulty
    difficulty = sum(word_difficulty_score(w) for w in all_words) / len(all_words)
    
    # Lower combined score is better (negative flow_score is good, lower difficulty is good)
    return {"flow": flow_score, "difficulty": difficulty, "combined": flow_score + difficulty}

def generate_word_chain(binomials, length=10):
    # If no binomials, return empty list
    if not binomials:
        print("No binomials provided, returning empty list", file=sys.stderr)
        return []
        
    try:
        graph = build_word_graph(binomials)
        all_words = list(graph.keys())
        print(f"Built word graph with {len(all_words)} unique words", file=sys.stderr)
        
        # No words in graph, return empty list
        if not all_words:
            print("No words in graph, returning empty list", file=sys.stderr)
            return []
        
        # Print a sample of words to help debug
        print(f"Sample words: {all_words[:10]}", file=sys.stderr)
        
        # Sort words by a combination of simplicity, connection count, and conceptual richness
        word_scores = []
        for word in all_words:
            connections = len(graph.get(word, []))
            difficulty = word_difficulty_score(word)
            
            # Bonus for words in concept groups (richer associations)
            concept_bonus = -5 if get_concept_group(word) else 0
            
            score = connections - difficulty + concept_bonus  # Higher score = better starting word
            word_scores.append((word, score))
        
        word_scores.sort(key=lambda x: x[1], reverse=True)
        start_words = [w for w, _ in word_scores[:250]]  # Try more potential starting words
        random.shuffle(start_words)  # Add some randomness

        # Generate multiple chains and pick the best one
        candidates = []
        max_candidates = 5  # Generate up to 5 valid chains to choose from
        start_words_tried = 0
        
        for start_word in start_words:
            start_words_tried += 1
            if start_words_tried % 50 == 0:
                print(f"Tried {start_words_tried} start words so far...", file=sys.stderr)
                
            chain = []
            visited_pairs = set()
            visited_words = set()
            
            # Create a chain with gradually increasing difficulty
            result = find_chain(graph, start_word, visited_words, visited_pairs, chain, length, difficulty_target=15)
            if result:
                print(f"Found valid chain starting with '{start_word}' after trying {start_words_tried} words", file=sys.stderr)
                
                # Evaluate the chain quality
                flow_metrics = evaluate_chain_flow(result)
                candidates.append((result, flow_metrics))
                print(f"Chain: {[(w1, w2) for w1, w2 in result]}", file=sys.stderr)
                print(f"Flow metrics: {flow_metrics}", file=sys.stderr)
                
                if len(candidates) >= max_candidates:
                    break

        # If we found candidates, choose the one with the best flow
        if candidates:
            # Sort by combined score (lower is better)
            candidates.sort(key=lambda x: x[1]["combined"])
            best_chain = candidates[0][0]
            
            # Calculate average word length as a simplicity metric
            all_chain_words = []
            for w1, w2 in best_chain:
                all_chain_words.extend([w1, w2])
            avg_length = sum(len(w) for w in all_chain_words) / len(all_chain_words)
            print(f"Average word length in chain: {avg_length:.1f}", file=sys.stderr)
            
            return best_chain

        # If normal search failed, try using our guaranteed chain method
        print(f"No valid chain found after trying {start_words_tried} words, using guaranteed method", file=sys.stderr)
        guaranteed_chain = create_guaranteed_chain(graph, length)
        if guaranteed_chain:
            return guaranteed_chain
            
        # No chain found, return empty list
        print("Even the guaranteed method could not find a chain. Returning empty list.", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error in generate_word_chain: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    try:
        # Get parameters from command line
        if len(sys.argv) >= 3:
            binomials_file = sys.argv[1]
            chain_length = int(sys.argv[2])
        else:
            binomials_file = "linked_binomials.json"
            chain_length = 10
        
        print(f"Starting word chain generation with file {binomials_file} and length {chain_length}", file=sys.stderr)
        
        # Limit chain length to a reasonable value to prevent long processing
        chain_length = min(chain_length, 50)
        
        # Load binomials and generate chain
        binomials = load_binomials(binomials_file)
        chain = generate_word_chain(binomials, length=chain_length)

        # Output the chain as JSON for easier parsing by Node.js
        # Convert tuples to lists for JSON serialization
        json_chain = [[w1, w2] for w1, w2 in chain] if chain else []
        print(json.dumps(json_chain))
        print(f"Generated chain with {len(json_chain)} pairs", file=sys.stderr)
    except Exception as e:
        # Catch any unexpected errors and return empty list
        print(f"Critical error: {str(e)}", file=sys.stderr)
        print(json.dumps([]))
