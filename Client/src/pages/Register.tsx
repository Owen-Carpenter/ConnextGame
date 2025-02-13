import "../styles/Authentication.css"
import { Link } from "react-router-dom"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

export function Register() {
    const[username, setUsername] = useState("");
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[confirmPassword, setConfirmPassword] = useState("");
    const[error, setError] = useState("");
    const[success, setSuccess] = useState("");
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

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!username || !email || !password || !confirmPassword){
            alert("Please fill in all required fields");
            return;
        }

        if(password !== confirmPassword){
            setError("Passwords do not match");
            return;
        }
        
        axios.post("http://localhost:8080/register", {username, password, email})
        .then(result => {
            setSuccess("Registration successful")
            console.log(result);
            navigate('/login');
        })
        .catch(err => {
            if (err.response && err.response.status === 409) {
                setError("Username already exists");
            } else {
                setError("An error occurred during registration. Please try again.");
            }
            setSuccess("");
            console.log(err);
        });
    }
    
    return (
        <div>
            <main className="scene" ref={sceneRef}></main>
            <section className="auth-section">
                <div className="auth-container">
                    <Link to="/" className="auth-logo-link">
                        <img className="auth-logo" src="/logo.png" alt="logo" />
                    </Link>
                    <h1>Register</h1>
                    <form onSubmit={handleRegisterSubmit}>
                    <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input required type="text" id="name" name="username" onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input required type="email" id="email" name="email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input required type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input required type="password" id="confirm-password" name="confirm-password" onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        {error && <p className="error">{error}</p>}
                        {success && <p className="success">{success}</p>}
                        <button className="login-submit-btn" type="submit">Sign Up</button>
                    </form>
                    <h4>Already have an account?<span><Link to={"/Login"}>Login</Link></span></h4>
                </div>
            </section>
        </div>
    )
}
