import "../styles/versus.css";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export function Versus() {
    const navigate = useNavigate();

    const handlePlayGame = () => {
        // This would eventually start the versus game
        // For now, let's simulate a game and redirect to GameStats
        navigate('/GameStats', {
            state: {
                gameMode: 'Versus',
                score: 150,
                wordsCompleted: 3,
                livesRemaining: 2
            }
        });
    };

    const handleBackToHome = () => {
        navigate("/Home");
    };

    return (
        <>
            <section className="versus">
                <div className="content-container">
                    <Header />
                    <div className="versus-placeholder">
                        <h2>Versus Mode</h2>
                        <p>This game mode is coming soon! Play against friends or AI opponents.</p>
                        <div className="versus-buttons">
                            <button className="play-btn" onClick={handlePlayGame}>
                                Demo Game Over Screen
                            </button>
                            <button className="home-btn" onClick={handleBackToHome}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}