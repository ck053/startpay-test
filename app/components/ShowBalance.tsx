// components/ShowBalance.tsx
import Link from 'next/link';

export default function ShowBalance({ balance }: { balance: number }) {
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
        Balance: {balance} ⭐
      </button>
    </Link>
  );
}