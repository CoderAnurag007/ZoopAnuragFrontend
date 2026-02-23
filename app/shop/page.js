import Link from "next/link";

export default function ShopPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Shop</h1>
      <p>Browse products here.</p>
      <Link href="/">Back to home</Link>
    </div>
  );
}
