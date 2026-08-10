import Hero from "../components/Hero/Hero";
import About from "../components/About/About";
import Programs from "../components/Programs/Programs";
import Trainers from "../components/Trainers/Trainers";
import Gallery from "../components/Gallery/Gallery";
import Schedule from "../components/Schedule/Schedule";
import Testimonials from "../components/Testimonials/Testimonials";
import Contact from "../components/Contact/Contact";
import TrialBooking from "../components/TrialBooking/TrialBooking";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Programs />
      <TrialBooking />
      <Trainers />
      <Gallery />
      <Schedule />
      <Testimonials />
      <Contact />
    </>
  );
}

export default Home;