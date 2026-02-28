import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Technology from "@/components/Technology";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Statistics from "@/components/Statistics";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="bg-transparent">
        <Hero />
        <Features />
        <Technology />
        <HowItWorks />
        {/* <Benefits /> */}
        <Statistics />
        <Contact />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
