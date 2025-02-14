import "../styles/Home.css";
import GameType from "../components/GameType";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useState, useEffect } from "react";

export function Home(){
    const nav = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("userToken"));
    
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("userToken"));
        };

        // local storage change
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

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
                            <GameType title="Classic"/>
                        </button>
                        <button className="game-link" onClick={() => handleGameSelection("/Infinite")}>
                            <GameType title="Infinite"/>
                        </button>
                        <button className="game-link" onClick={() => handleGameSelection("/Versus")}>
                            <GameType title="Versus"/>
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