import { useState } from 'react';
import '../styles/Game.css';

interface HelpModalProps {
  gameMode: 'Classic' | 'Infinite';
}

export function HelpModal({ gameMode }: HelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const rules = {
    Classic: [
      "Connect words in a chain by finding the next word",
      "You are given a word and you need to find the next word in the chain",
      "Example: If the previous word is 'dog' and the next word starts with 'h', the answer would be 'house'",
      "You have 5 lives to complete the chain",
      "Complete the chain to win and increase your streak",
      "Losing resets your streak to 0"
    ],
    Infinite: [
      "Connect words in an endless chain",
      "You are given a word and you need to find the next word in the chain",
      "Example: If the previous word is 'dog' and the next word starts with 'h', the answer would be 'house'",
      "You have 5 lives to keep going",
      "Score points based on word length",
      "Try to beat your high score!"
    ]
  };

  return (
    <>
      <button 
        className="help-button" 
        onClick={() => setIsOpen(true)}
        title="How to Play"
      >
        ?
      </button>

      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
            <h2>How to Play {gameMode} Mode</h2>
            <ul>
              {rules[gameMode].map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
} 