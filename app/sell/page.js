import Link from "next/link";

export default function SellPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Sell</h1>
      <p>List your products here.</p>
      <Link href="/">Back to home</Link>
    </div>
  );
}
