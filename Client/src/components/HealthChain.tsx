import React, { useEffect, useState } from 'react';
import '../styles/HealthChain.css';
import fiveLives from "../assets/Five_Lives.png";
import fourLives from "../assets/Four_Lives.png";
import threeLives from "../assets/Three_Lives.png";
import twoLives from "../assets/Two_Lives.png";
import oneLife from "../assets/One_Life.png";
import zeroLives from "../assets/Zero_Lives.png";

interface HealthChainProps {
  lives: number;
  maxLives: number;
  gainLife: boolean;
  loseLife: boolean;
}

export const HealthChain: React.FC<HealthChainProps> = ({ 
  lives, 
  maxLives = 5,
  gainLife = false,
  loseLife = false
}) => {
  const livesImages = [zeroLives, oneLife, twoLives, threeLives, fourLives, fiveLives];
  const [showAlternateImage, setShowAlternateImage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Blinking effect between two images
  useEffect(() => {
    if (gainLife || loseLife) {
      setIsAnimating(true);
      
      // Set up blinking interval
      const blinkInterval = setInterval(() => {
        setShowAlternateImage(prev => !prev);
      }, 250); // Toggle every 250ms (4 times per second)
      
      // Clear animation after it completes
      const timer = setTimeout(() => {
        clearInterval(blinkInterval);
        setShowAlternateImage(false);
        setIsAnimating(false);
      }, 1500);
      
      return () => {
        clearInterval(blinkInterval);
        clearTimeout(timer);
      };
    }
  }, [gainLife, loseLife]);

  // Determine which image to show
  const getDisplayImage = () => {
    if (!isAnimating) {
      return livesImages[lives];
    }
    
    if (gainLife) {
      // When gaining life, alternate between current and higher life image
      return showAlternateImage ? livesImages[lives] : livesImages[Math.min(lives + 1, maxLives)];
    } else if (loseLife) {
      // When losing life, alternate between current and lower life image
      return showAlternateImage ? livesImages[lives] : livesImages[Math.max(lives - 1, 0)];
    }
    
    return livesImages[lives];
  };

  return (
    <div className="health-chain-container">
      <div className="health-chain">
        <img 
          src={getDisplayImage()} 
          alt={`Lives: ${lives}`} 
          className="lives-image"
        />
      </div>
    </div>
  );
}; 