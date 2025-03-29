import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentResult.css';

function PaymentCancel() {
    const navigate = useNavigate();
    
    const sceneRef = useRef<HTMLElement>(null);

    const randomWords = [
        "Galaxy", "Nebula", "Star", "Cosmos", "Meteor", "Orbit", "Asteroid", 
        "Comet", "Planet", "Universe", "Blackhole", "Supernova", "Quasar", 
        "Lightyear", "Exoplanet", "Constellation", "Gravity", "Solar", "Rocket"
    ];

    const fontFamilies = [
        "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia", 
        "Comic Sans MS", "Tahoma", "Trebuchet MS", "Roboto", "Lobster"
    ];

    const fontSizes = [
        "10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px"
    ];

    useEffect(() => {
        const scene = sceneRef.current;

        if (scene) {
            const CreateDiv = () => {
                for (let i = 0; i < 150; i++) {
                    const div = document.createElement("div");
                    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
                    const randomFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
                    const randomFontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];

                    div.textContent = randomWord;
                    div.style.fontFamily = randomFontFamily;
                    div.style.fontSize = randomFontSize;

                    scene.appendChild(div);
                }
            };
            CreateDiv();

            const stars = scene.querySelectorAll('div');
            stars.forEach(star => {
                const x = `${Math.random() * 200}vmax`;
                const y = `${Math.random() * 100}vh`;
                const z = `${Math.random() * 200 - 100}vmin`;
                const rx = `${Math.random() * 360}deg`;
                star.style.setProperty('--x', x);
                star.style.setProperty('--y', y);
                star.style.setProperty('--z', z);
                star.style.setProperty('--rx', rx);
                const delay = `${Math.random() * 1.5}s`;
                star.style.animationDelay = delay;
            });
        }
        return () => {
            if (scene) {
                scene.innerHTML = '';
            }
        };
    }, []);
    
    return (
        <div>
            <main className="scene" ref={sceneRef}></main>
            <div className="payment-result-container">
                <div className="payment-result cancelled">
                    <div className="cancel-icon">!</div>
                    <h2>Payment Cancelled</h2>
                    <p>Your payment was cancelled. No charges were made.</p>
                    <button onClick={() => navigate('/subscribe')}>Return to Subscription Page</button>
                </div>
            </div>
        </div>
    );
}

export default PaymentCancel;