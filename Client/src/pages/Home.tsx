import "../styles/Home.css";
import GameType from "../components/GameType";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useState, useEffect } from "react";

export function Home(){
    const nav = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("userToken"));
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    useEffect(() => {
        const handleStorageChange = () => {
            const newAuthState = !!localStorage.getItem("userToken");
            
            // If authentication state changed (login or logout)
            if (newAuthState !== isAuthenticated) {
                setIsAuthenticated(newAuthState);
                
                // If user just logged in, reset cached scores to prevent seeing previous user's scores
                if (newAuthState) {
                    localStorage.removeItem("classicStreak");
                    localStorage.removeItem("infiniteTopScore");
                }
                
                // Force refresh to update streak display
                setRefreshTrigger(prev => prev + 1);
            }
        };

        // local storage change
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [isAuthenticated]);

    const handleGameSelection = (path: string) => {
        if (!isAuthenticated) {
            nav("/Login");
        } else {
            nav(path);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        setIsAuthenticated(false);
        nav("/Home");
    };

    return(
        <>
            <section className="home">
                <div className="content-container">
                    <Header />
                    <div className="game-selection-container">
                        <button className="game-link" onClick={() => handleGameSelection("/Classic")}>
                            <GameType title="Classic" key={`classic-${refreshTrigger}`} />
                        </button>
                        <button className="game-link" onClick={() => handleGameSelection("/Infinite")}>
                            <GameType title="Infinite" key={`infinite-${refreshTrigger}`} />
                        </button>
                        <button className="game-link" onClick={() => handleGameSelection("/Versus")}>
                            <GameType title="Versus" />
                        </button>
                    </div>
                    <div className="button-container">
                        <Link className="home-btn" to="/Subscribe">No Ads</Link>
                        {isAuthenticated ? (
                            <button className="home-btn" onClick={handleLogout}>Logout</button>
                        ) : (
                            <Link className="home-btn" to="/Login">Login</Link>
                        )}
                        <Link className="home-btn" to="/Leaderboard">Leaderboard</Link>
                    </div>
                </div>
            </section>
        </>
    );
}