import "../styles/Classic.css";
import Header from "../components/Header";
import { ClassicGame } from "../components/ClassicGame";

export function Classic(){
    return(
        <>
            <section className="classic">
                <div className="content-container">
                    <Header />
                    <ClassicGame />
                </div>
            </section>
        </>
    )
}