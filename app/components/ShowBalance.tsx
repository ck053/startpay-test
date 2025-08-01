// components/ShowBalance.tsx
import Link from 'next/link';

export default function ShowBalance({ balance, text }: { balance: number, text:string }) {
  return (
    <Link href="/purchase">
      <button style={{
        padding: '10px 20px',
        fontSize: '16px',
        color: 'white',
        backgroundColor: '#0070f3',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        {text} {balance} 🪙
      </button>
    </Link>
  );
}