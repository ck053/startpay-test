'use client';

export default function Board() {
    return (
        <div className="gameboard app-container">
        <div className="playerhand">
                <div 
                    id="tile1" 
                    style={{ backgroundImage: "url('Regular/0m.png')" }} 
                    className="tile"
                ></div>
                <div 
                    id="tile2" 
                    style={{ backgroundImage: "url('Regular/0m.png')" }} 
                    className="tile"
                ></div>
                <div 
                    id="tile3" 
                    style={{ backgroundImage: "url('Regular/0m.png')" }} 
                    className="tile"
                ></div>
            </div>
        </div>
    )
}