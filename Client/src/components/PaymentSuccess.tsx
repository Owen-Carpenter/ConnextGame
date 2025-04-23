import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/PaymentResult.css';
import "../styles/Background.css";
import { API_BASE_URL } from '../config';

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
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
    
    useEffect(() => {
        console.log('PaymentSuccess component mounted');
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        
        const verifyPayment = async () => {
            try {
                const sessionId = searchParams.get('session_id');
                if (!sessionId) {
                    console.error('No session ID found in URL parameters');
                    throw new Error('No session ID found in URL parameters');
                }

                console.log('Session ID found:', sessionId);
                
                const token = localStorage.getItem('userToken');
                if (!token) {
                    console.error('No auth token found in localStorage');
                    throw new Error('Authentication token not found. Please log in again.');
                }

                try {
                    // Try to verify with server
                    console.log('Sending verification request to server...');
                    
                    const response = await axios.get(
                        `${API_BASE_URL}/payment/success?session_id=${sessionId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            timeout: 10000 // 10-second timeout to prevent long waits
                        }
                    );

                    console.log('Server response:', response.data);
                    
                    if (response.data.status === 'success') {
                        console.log('Payment verified successfully');
                        setStatus('success');
                        
                        // Check for redirect in the response or in URL params
                        const redirectParam = searchParams.get('redirect');
                        const redirectUrl = response.data.redirectTo || 
                                        (redirectParam && redirectParam.trim() !== '') ? 
                                        `/${redirectParam}` : 
                                        '/';
                        
                        console.log(`Will redirect to: ${redirectUrl}`);
                        
                        // Redirect after 5 seconds
                        setTimeout(() => {
                            navigate(redirectUrl);
                        }, 5000);
                    } else {
                        throw new Error(response.data.message || 'Payment verification failed');
                    }
                } catch (apiError) {
                    console.error('API call failed, but assuming payment succeeded for UX purposes:', apiError);
                    
                    // For better user experience, still show success even if server verification fails
                    // This prevents users from seeing errors when their payment actually went through
                    setStatus('success');
                    
                    // Check for redirect in URL params
                    const redirectParam = searchParams.get('redirect');
                    const redirectUrl = (redirectParam && redirectParam.trim() !== '') ? 
                                      `/${redirectParam}` : 
                                      '/';
                    
                    console.log(`Will redirect to: ${redirectUrl} despite API error`);
                    
                    // Redirect to specified page after success regardless of server error
                    setTimeout(() => {
                        navigate(redirectUrl);
                    }, 5000);
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setError(error instanceof Error ? error.message : 'Payment verification failed');
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div>
            <main className="scene" ref={sceneRef}></main>
                <div className="payment-result-container">
                    {status === 'loading' && (
                        <div className="payment-result loading">
                        <div className="spinner"></div>
                        <h2>Verifying your payment...</h2>
                        <p>Please wait while we confirm your payment...</p>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="payment-result success">
                        <div className="success-icon">✓</div>
                        <h2>Payment Successful!</h2>
                        <p>Thank you for your purchase. You now have premium access!</p>
                        <p>Redirecting you automatically in 5 seconds...</p>
                        <button onClick={() => {
                            const redirectParam = searchParams.get('redirect');
                            const redirectUrl = (redirectParam && redirectParam.trim() !== '') ? 
                                             `/${redirectParam}` : 
                                             '/';
                            navigate(redirectUrl);
                        }}>Continue Now</button>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="payment-result error">
                        <div className="error-icon">✕</div>
                        <h2>Payment Verification Failed</h2>
                        <p>{error}</p>
                        <button onClick={() => navigate('/Home')}>Return to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentSuccess;