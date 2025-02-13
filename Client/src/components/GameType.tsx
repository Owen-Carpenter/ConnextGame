import React from 'react'

function GameType({ title }: { title: string }) {  
    let backgroundClass = "";

    switch(title.toLocaleLowerCase()){
      case "classic":
        backgroundClass = "classic-bg";
        break;
      case "infinite":
        backgroundClass = "infinite-bg";
        break;
      case "versus":
        backgroundClass = "versus-bg";
        break;
      default:
        backgroundClass = "default-bg";
    }

    return (
    <div className={`game-select-card ${backgroundClass}`} >
      <h1 className="card-title">{title}</h1>  
    </div>
  );
}

export default GameType
