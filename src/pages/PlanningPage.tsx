import Navbar from "@/components/Navbar";
import CalendarPreview from "@/components/CalendarPreview";
import Footer from "@/components/Footer";

const PlanningPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <CalendarPreview />
      </div>
      <Footer />
    </div>
  );
};

export default PlanningPage;
