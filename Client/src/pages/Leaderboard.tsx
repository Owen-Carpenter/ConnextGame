import "../styles/Leaderboard.css";
import Header from "../components/Header";
import { useEffect, useRef } from "react";
import "../styles/Background.css"
import "swiper/css"; 
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

export function Leaderboard() {
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
                                    <ul>
                                        <li>
                                            <h3 className="position">1.</h3>
                                            <h3 className="name">Player A</h3>
                                            <h3 className="points">1200 pts</h3>
                                        </li>
                                        <li>
                                            <h3 className="position">2.</h3>
                                            <h3 className="name">Player B</h3>
                                            <h3 className="points">1100 pts</h3>
                                        </li>
                                        <li>
                                            <h3 className="position">3.</h3>
                                            <h3 className="name">Player C</h3>
                                            <h3 className="points">1050 pts</h3>
                                        </li>
                                    </ul>
                                </div>
                            </SwiperSlide>

                            <SwiperSlide>
                                <div className="leaderboard-box">
                                    <h2>Infinite Leaderboard</h2>
                                    <ul>
                                        <li>
                                            <h3 className="position">1.</h3>
                                            <h3 className="name">Player X</h3>
                                            <h3 className="points">97 Words</h3>
                                        </li>
                                        <li>
                                            <h3 className="position">2.</h3>
                                            <h3 className="name">Player Y</h3>
                                            <h3 className="points">54 Words</h3>
                                        </li>
                                        <li>
                                            <h3 className="position">3.</h3>
                                            <h3 className="name">Player Z</h3>
                                            <h3 className="points">22 Words</h3>
                                        </li>
                                    </ul>
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
