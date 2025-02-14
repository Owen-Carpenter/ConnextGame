import "../styles/Payment.css";

function Payment({ time, deal, rate, saving, tag }: { time: string, deal: string, rate: string, saving: string, tag: string }){
    return(
        <>
            <div className="payment-card">
                {tag && <div className="tag">{tag}</div>}
                <div className="payment-left-side">
                    <h1 className="payment-time">{time}</h1>
                    <h2 className="payment-deal">{deal}</h2>
                </div>
                <div className="payment-right-side">
                    <h1 className="payment-rate">{rate}</h1>
                    <h3 className="payment-saving">{saving}</h3>
                </div>
            </div>
        </>
    );
}

export default Payment