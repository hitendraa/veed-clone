import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";


export default function Home() {
  return (
    <main className='bg-[#ECEEEE] min-h-screen'>
      <Navbar />
      <div className="pt-20">
        <Hero />
      </div>
    </main>
  );
}
