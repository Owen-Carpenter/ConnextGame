import "../styles/Infinite.css";
import Header from "../components/Header";
import { InfiniteGame } from "../components/InfiniteGame";

export function Infinite(){
    return(
        <>
            <section className="infinite">
                <div className="content-container">
                    <Header />
                    <InfiniteGame />
                </div>
            </section>
        </>
    )
}