import React from 'react'
import "../styles/Authentication.css"
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username || !password) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            const result = await axios.post("http://localhost:8080/auth", { username, password });
            if (result.data.message === "Login successful") {
                localStorage.setItem("isAuthenticated", "true");
                navigate('/Home', { replace: true });
            } else if (result.data.message === "Incorrect password") {
                alert("Incorrect email or password");
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <main className="scene" ref={sceneRef}></main>
            <section className="auth-section">
                <div className="auth-container">
                <Link to="/" className="auth-logo-link">
                    <img className="auth-logo" src="/logo.png" alt="logo" />
                </Link>
                    <h1>Login</h1>
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input required type="text" id="username" name="username" onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input required type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button className="login-submit-btn" type="submit">Login</button>
                    </form>
                    <h4>Don't have an account?<span><Link to={"/Register"}>Sign up</Link></span></h4>
                </div>
            </section>
        </div>
    );
}
