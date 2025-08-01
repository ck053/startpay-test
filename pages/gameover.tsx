import { Translations } from "@/app/types/en";
import { useEffect, useRef, useState } from "react";

type GameOverProps = {
    gameoverpagebody: React.RefObject<HTMLDivElement>;
    navigateTo: (path: string) => void;
    GameOverDisplay: boolean;
    setGameOverDisplay: React.Dispatch<React.SetStateAction<boolean>>;
    text: Translations;
}

export default function Gameoverpage({ gameoverpagebody, navigateTo, GameOverDisplay, setGameOverDisplay, text }: GameOverProps) {
    const handleHome = () => {
        setGameOverDisplay(false);
        navigateTo('home');
    }

    function createEmbers() {
        if (!GameOverDisplay) return;
        const colors = ['#ff4d4d', '#ff7676', '#ff9999', '#ffcc00', '#ff6600'];
        for (let i = 0; i < 50; i++) {
            const ember = document.createElement('div');
            ember.className = 'embers';
            ember.style.left = Math.random() * 100 + 'vw';
            ember.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            ember.style.opacity = String(Math.random() * 0.7 + 0.3);
            gameoverpagebody.current?.appendChild(ember);
            
            // Animation
            const animation = ember.animate([
                { transform: 'translateY(0) translateX(0)', opacity: 1 },
                { 
                    transform: `translateY(${Math.random() * 100 + 100}vh) 
                               translateX(${Math.random() * 200 - 100}px)`, 
                    opacity: 0 
                }
            ], {
                duration: Math.random() * 3000 + 15000,
                delay: Math.random() * 6000,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
            });
            
            animation.onfinish = () => ember.remove();
        }
    }

    useEffect(() => {
        createEmbers();
        const interval = setInterval(createEmbers, 6000);
        return () => clearInterval(interval);
    },[GameOverDisplay]);

    return (<div className="gameover-container">
                <div className="skull">💀</div>
                <h1 className="gameover_title">{text?.gameover || 'Game Over'}</h1>
                <button className="btn-restart" onClick={handleHome}>{text?.home || "Go Home"}</button>
            </div>
            )
}

