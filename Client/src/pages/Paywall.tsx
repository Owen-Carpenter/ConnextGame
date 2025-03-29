import "../styles/paywall.css";
import Payment from "../components/PaymentCard";
import Header from "../components/Header";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Paywall(){
    const nav = useNavigate();
    const isAuthenticated = !!localStorage.getItem("userToken");

    useEffect(() => {
        if (!isAuthenticated) {
            nav("/Login");
        }
    }, [isAuthenticated, nav]);

    return(
        <>
            <section className="paywall">
                <div className="content-container">
                    <Header />
                    <Payment 
                        time="Monthly" 
                        deal="3 days free" 
                        rate="$0.99/month" 
                        saving="base" 
                        tag=""
                        subscriptionType="Monthly"
                    />
                    <Payment 
                        time="Yearly" 
                        deal="1 week free" 
                        rate="$9.99/year" 
                        saving="$0.83/month" 
                        tag="Save 15%" 
                        subscriptionType="Yearly"
                    />
                    <Payment 
                        time="Lifetime" 
                        deal="forever..." 
                        rate="$24.99" 
                        saving="one-time" 
                        tag="Best Deal" 
                        subscriptionType="Lifetime"
                    />
                </div>
            </section>
        </>
    )
}