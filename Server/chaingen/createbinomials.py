from datasets import load_dataset
import nltk
import json
from nltk import pos_tag, word_tokenize
from nltk.corpus import wordnet as wn
from collections import defaultdict
from tqdm import tqdm

# Download NLTK resources
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
nltk.download('averaged_perceptron_tagger_eng')
nltk.download('wordnet')
nltk.download('omw-1.4')

def is_in_dictionary(word):
    return bool(wn.synsets(word.lower()))

def extract_binomials_from_text(text, pair_counts):
    sentences = nltk.sent_tokenize(text)
    for sentence in sentences:
        tokens = word_tokenize(sentence)
        tagged = pos_tag(tokens)

        for i in range(len(tagged) - 2):
            w1, t1 = tagged[i]
            conj, t2 = tagged[i + 1]
            w2, t3 = tagged[i + 2]

            if (
                t1.startswith('NN') and
                conj.lower() in ['and', 'or'] and
                t3.startswith('NN')
            ):
                if t1.startswith('NNP') or t3.startswith('NNP'):
                    continue
                if w1[0].isupper() or w2[0].isupper():
                    continue

                w1_l = w1.lower()
                w2_l = w2.lower()
                if w1_l == w2_l:
                    continue  # skip duplicates like "time and time"
                if is_in_dictionary(w1_l) and is_in_dictionary(w2_l):
                    pair = (w1_l, w2_l)
                    pair_counts[pair] += 1

def process_openwebtext(num_samples=1000, min_frequency=3):
    pair_counts = defaultdict(int)

    print("Loading OpenWebText dataset...")
    dataset = load_dataset("openwebtext", split="train", streaming=True, trust_remote_code=True)

    print(f"Processing {num_samples} samples...")
    for i, example in enumerate(tqdm(dataset)):
        if i >= num_samples:
            break
        text = example['text']
        extract_binomials_from_text(text, pair_counts)

    filtered_binomials = [[w1, w2] for (w1, w2), count in pair_counts.items() if count >= min_frequency]
    return sorted(filtered_binomials)

def save_to_json(binomials, filename="openwebtext_binomials.json"):
    with open(filename, 'w') as f:
        json.dump(binomials, f, indent=2)
    print(f"\u2705 Saved {len(binomials)} binomial expressions to {filename}")

if __name__ == "__main__":
    MIN_FREQUENCY = 3
    NUM_SAMPLES = 50000

    binomials = process_openwebtext(num_samples=NUM_SAMPLES, min_frequency=MIN_FREQUENCY)
    save_to_json(binomials)