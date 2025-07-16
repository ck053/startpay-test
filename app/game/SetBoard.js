export const SetBoard = () => {
    
    const boardRef = useRef(null);

    useEffect(() => {
        // Log the size of the game board after it mounts
        if (boardRef.current) {
            const { offsetWidth, offsetHeight } = boardRef.current;
            console.log(`Game Board Size: ${offsetWidth}px x ${offsetHeight}px`);
        }
    }, []);

    return(
    <div className="gameboard" ref={boardRef}>
        <div id="tile1" style="background-image: url('@/public/Regular/0m.png')" className="tile"></div>
    </div>
    )
}