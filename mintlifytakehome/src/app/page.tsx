import Image from "next/image";
import Solution from "./Solution";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Solution/>
    </main>
  );
}
