import "../styles/Leaderboard.css";
import Header from "../components/Header";
import { useEffect, useRef, useState } from "react";
import "../styles/Background.css"
import "swiper/css"; 
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from '../config';

// Define types for the leaderboard data
interface ClassicLeaderboardEntry {
    username: string;
    games: {
        classic: {
            streak: number;
        };
    };
}

interface InfiniteLeaderboardEntry {
    username: string;
    games: {
        infinite: {
            topScore: number;
        };
    };
}

export function Leaderboard() {
    const sceneRef = useRef<HTMLElement>(null);
    const [classicLeaderboard, setClassicLeaderboard] = useState<ClassicLeaderboardEntry[]>([]);
    const [infiniteLeaderboard, setInfiniteLeaderboard] = useState<InfiniteLeaderboardEntry[]>([]);
    const [loading, setLoading] = useState({
        classic: true,
        infinite: true
    });
    const [error, setError] = useState({
        classic: "",
        infinite: ""
    });
    const [refreshing, setRefreshing] = useState(false);
    const location = useLocation();
    
    // Function to fetch classic leaderboard data
    const fetchClassicLeaderboard = async () => {
        try {
            setLoading(prev => ({ ...prev, classic: true }));
            console.log("Fetching classic leaderboard data...");
            const response = await axios.get(`${API_BASE_URL}/game/leaderboard/classic`);
            console.log("Classic leaderboard data:", response.data);
            setClassicLeaderboard(response.data.leaderboard);
            setError(prev => ({ ...prev, classic: "" }));
        } catch (err) {
            console.error("Error fetching classic leaderboard:", err);
            setError(prev => ({ 
                ...prev, 
                classic: "Failed to load classic leaderboard data. Please try again later."
            }));
        } finally {
            setLoading(prev => ({ ...prev, classic: false }));
        }
    };
    
    // Function to fetch infinite leaderboard data
    const fetchInfiniteLeaderboard = async () => {
        try {
            setLoading(prev => ({ ...prev, infinite: true }));
            console.log("Fetching infinite leaderboard data...");
            const response = await axios.get(`${API_BASE_URL}/game/leaderboard/infinite`);
            console.log("Infinite leaderboard data:", response.data);
            setInfiniteLeaderboard(response.data.leaderboard);
            setError(prev => ({ ...prev, infinite: "" }));
        } catch (err) {
            console.error("Error fetching infinite leaderboard:", err);
            setError(prev => ({ 
                ...prev, 
                infinite: "Failed to load infinite leaderboard data. Please try again later."
            }));
        } finally {
            setLoading(prev => ({ ...prev, infinite: false }));
        }
    };
    
    // Function to refresh all leaderboards
    const refreshLeaderboards = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchClassicLeaderboard(),
                fetchInfiniteLeaderboard()
            ]);
        } catch (error) {
            console.error("Error refreshing leaderboards:", error);
        } finally {
            setRefreshing(false);
        }
    };
    
    // Fetch data when component mounts or location changes
    useEffect(() => {
        fetchClassicLeaderboard();
        fetchInfiniteLeaderboard();
        
        // Set up auto-refresh interval (every 10 seconds)
        const refreshInterval = setInterval(() => {
            console.log("Auto-refreshing leaderboards...");
            refreshLeaderboards();
        }, 10000); // 10 seconds
        
        // Listen for localStorage changes that might indicate new scores
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "classicStreak" || e.key === "infiniteTopScore") {
                console.log("Storage change detected, refreshing leaderboards");
                refreshLeaderboards();
            }
        };
        
        window.addEventListener("storage", handleStorageChange);
        
        return () => {
            clearInterval(refreshInterval);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [location.key]); // Re-fetch when location changes
    
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

    // Helper function to render classic leaderboard entries
    const renderClassicLeaderboard = () => {
        if (loading.classic) {
            return <div className="loading">Loading leaderboard data...</div>;
        }
        
        if (error.classic) {
            return <div className="error">{error.classic}</div>;
        }
        
        if (!classicLeaderboard || classicLeaderboard.length === 0) {
            return (
                <div className="empty-leaderboard">
                    <p>No streak data available yet. Be the first to set a record!</p>
                </div>
            );
        }
        
        return (
            <ul>
                {classicLeaderboard.map((entry, index) => (
                    <li key={index}>
                        <h3 className="position">{index + 1}.</h3>
                        <h3 className="name">{entry.username}</h3>
                        <h3 className="points">{entry.games.classic.streak} Streak</h3>
                    </li>
                ))}
            </ul>
        );
    };
    
    // Helper function to render infinite leaderboard entries
    const renderInfiniteLeaderboard = () => {
        if (loading.infinite) {
            return <div className="loading">Loading leaderboard data...</div>;
        }
        
        if (error.infinite) {
            return <div className="error">{error.infinite}</div>;
        }
        
        if (!infiniteLeaderboard || infiniteLeaderboard.length === 0) {
            return (
                <div className="empty-leaderboard">
                    <p>No score data available yet. Be the first to set a record!</p>
                </div>
            );
        }
        
        return (
            <ul>
                {infiniteLeaderboard.map((entry, index) => (
                    <li key={index}>
                        <h3 className="position">{index + 1}.</h3>
                        <h3 className="name">{entry.username}</h3>
                        <h3 className="points">{entry.games.infinite.topScore} Words</h3>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            <main className="scene" ref={sceneRef}></main>
            <section className="leaderboard">
                <div className="content-container">
                    <Header />
                    <div className="leaderboard-container">
                        <Swiper
                            pagination={{ clickable: true }}
                            modules={[Pagination]}
                            spaceBetween={20}
                            slidesPerView={1}
                        >
                            <SwiperSlide>
                                <div className="leaderboard-box">
                                    <h2>Classic Leaderboard</h2>
                                    {renderClassicLeaderboard()}
                                </div>
                            </SwiperSlide>

                            <SwiperSlide>
                                <div className="leaderboard-box">
                                    <h2>Infinite Leaderboard</h2>
                                    {renderInfiniteLeaderboard()}
                                </div>
                            </SwiperSlide>

                            <SwiperSlide>
                                <div className="leaderboard-box">
                                    <h2>Versus Leaderboard</h2>
                                    <ul>
                                        <li>
                                            <h3 className="position">1.</h3>
                                            <h3 className="name">Player M</h3>
                                            <h3 className="points">3 Wins</h3>
                                        </li>
                                        <li>
                                            <h3 className="position">2.</h3>
                                            <h3 className="name">Player N</h3>
                                            <h3 className="points">2 Wins</h3>
                                        </li>
                                        <li>
                                            <h3 className="position">3.</h3>
                                            <h3 className="name">Player O</h3>
                                            <h3 className="points">1 Win</h3>
                                        </li>
                                    </ul>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </section>
        </>
    );
}
