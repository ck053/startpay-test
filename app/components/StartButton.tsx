'use client';

import Link from 'next/link';

export default function StartButton() {
    return(<div>
        <h1>Welcome to Our Site</h1>
        <Link href="/game">
            <button style={{ padding: '10px 20px', fontSize: '16px' }}>
                Go to Game Page
            </button>
        </Link>
    </div>)
}