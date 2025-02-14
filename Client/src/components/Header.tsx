import "../styles/Header.css";
import { Link } from "react-router-dom";

function Header(){
    return(
        <>
            <div className="header-container">
                <Link to={"/"}><img className="logo" src="/logo.png" alt="" /></Link>
                <h1 className="title">Connext</h1>
            </div>
        </>
    );
}

export default Header