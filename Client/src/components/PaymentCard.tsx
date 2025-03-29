import "../styles/Payment.css";
import { useState } from "react";
import axios, { AxiosError } from "axios";

interface PaymentProps {
    time: string;
    deal: string;
    rate: string;
    saving: string;
    tag?: string;
    subscriptionType: 'Monthly' | 'Yearly' | 'Lifetime';
}

function Payment({ time, deal, rate, saving, tag, subscriptionType }: PaymentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("userToken");
            if (!token) {
                console.error('No access token found');
                return;
            }

            console.log('Sending payment request with:', {
                subscriptionType,
                token: token.substring(0, 10) + '...' // Only log first 10 chars for security
            });

            const response = await axios.post(
                "http://localhost:8080/payment/create-checkout-session",
                { subscriptionType },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Payment response:', response.data);
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Payment error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                setError(error.response?.data?.message || 'Payment failed. Please try again.');
            } else {
                console.error('Unexpected error:', error);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className={`payment-card ${isLoading ? 'loading' : ''}`} 
            onClick={handlePayment}
        >
            {tag && <div className="tag">{tag}</div>}
            <div className="payment-left-side">
                <h1 className="payment-time">{time}</h1>
                <h2 className="payment-deal">{deal}</h2>
            </div>
            <div className="payment-right-side">
                <h1 className="payment-rate">{rate}</h1>
                <h3 className="payment-saving">{saving}</h3>
            </div>
            {isLoading && <div className="loading-overlay">Processing...</div>}
            {error && <div className="error">{error}</div>}
        </div>
    );
}

export default Payment;