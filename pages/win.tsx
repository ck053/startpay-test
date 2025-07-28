import { useEffect, useRef, useState } from "react";

type WinProps = {
    winpagebody: React.RefObject<HTMLDivElement>;
    balance: number;
    navigateTo: (path: string) => void;
    WinDisplay: boolean;
    setWinDisplay: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Winpage({ winpagebody, balance, navigateTo, WinDisplay, setWinDisplay }: WinProps) {
    const [showStar, setShowStar] = useState(false);
    const handleClaimReward = () => {
        setWinDisplay(false);
        navigateTo('home');
        // setShowStar(true);
        // setTimeout(() => {setShowStar(false); navigateTo('home');}, 2000); // Hide after 2 seconds
      };

    function createConfetti() {
        if (!WinDisplay) return;
        const colors = ['#00ffaa', '#00b7ff', '#ff00aa', '#ffcc00', '#ff6600'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = String(Math.random() * 0.7 + 0.3);
            winpagebody.current?.appendChild(confetti);
            
            // Animation
            const animation = confetti.animate([
                { transform: 'translateY(-100vh) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${Math.random() * 100 + 100}vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 15000,
                delay: Math.random() * 6000,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
            });
            
            animation.onfinish = () => confetti.remove();
        }
    }

    useEffect(() => {
        createConfetti();
        const interval = setInterval(createConfetti, 6000);
        return () => clearInterval(interval);
    },[WinDisplay]);

    return (<div className="winner-container">
                <div className="trophy">🏆</div>
                <h1 className="win_title">You Win!</h1>
                <button className="btn-reward" onClick={handleClaimReward}>Go Home</button>
                {showStar ? (
                    <div className="star-popup">
                        <div className="rotating-star">⭐</div>
                        <p className="star-number"> {balance} </p>
                    </div>
                ) : null}
            </div>
            )
}