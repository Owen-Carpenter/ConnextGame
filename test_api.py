import requests
import json

try:
    print("Testing API connection to http://localhost:8080/chaingen/generate")
    response = requests.post(
        "http://localhost:8080/chaingen/generate",
        json={"gameType": "classic", "length": 10},
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Response JSON: {json.dumps(data, indent=2)}")
            
            if "wordChain" in data:
                print(f"Word chain length: {len(data['wordChain'])}")
                print("First few items:")
                for i, pair in enumerate(data["wordChain"][:3]):
                    print(f"  {i+1}. {pair}")
            else:
                print("No wordChain in response")
        except json.JSONDecodeError:
            print("Could not decode JSON response")
            print(f"Raw response: {response.text[:200]}...")
    else:
        print(f"Error response: {response.text[:200]}...")
        
except Exception as e:
    print(f"Error connecting to API: {str(e)}") 