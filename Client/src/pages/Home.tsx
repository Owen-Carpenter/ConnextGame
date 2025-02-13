import "../styles/Home.css";
import GameType from "../components/GameType";
import { Link } from "react-router-dom";

export function Home(){

    return(
        <>
            <section className="home">
                <div className="content-container">
                    <div className="header-container">
                        <img className="logo" src="/logo.png" alt="" />
                        <h1 className="title">Connext</h1>
                    </div>
                    <div className="game-selection-container">
                        <GameType title="Classic"/>
                        <GameType title="Infinite"/>
                        <GameType title="Versus"/>
                    </div>
                    <div className="button-container">
                        <Link className="home-btn" to="/Subscribe">No Ads</Link>
                        <Link className="home-btn" to="/Login">Login</Link>
                        <Link className="home-btn" to="/Leaderboard">Leaderboard</Link>
                    </div>
                </div>
            </section>
        </>
    );
}