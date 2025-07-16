'use client';

import Link from 'next/link';

export default function StartButton() {
    return(<div>
        <h1>Welcome to Our Site</h1>
        <Link href="/game">
            <button className="button">
                Go to Game Page
            </button>
        </Link>
    </div>)
}