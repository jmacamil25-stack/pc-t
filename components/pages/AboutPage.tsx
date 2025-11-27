import React, { useEffect } from 'react';

const AboutPage: React.FC = () => {
  
  useEffect(() => {
    document.title = "About Us | Local Used Car Dealer Eugene OR | Pacific Cars";
  }, []);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-[#002B60] sm:text-5xl">
            About Pacific Cars and Trucks
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Eugene's Trusted Partner for Quality Used Cars since 2010
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Welcome to <strong>Pacific Cars and Trucks</strong>, your premier destination for high-quality, affordable used cars in <strong>Eugene, Oregon</strong>. As a locally owned and operated dealership conveniently located on <strong>Highway 99 North</strong>, we are deeply committed to serving our community, including drivers from Springfield, Santa Clara, Junction City, and throughout Lane County.
            </p>
            <p>
              We believe that purchasing a vehicle should be a straightforward and transparent process. That's why we've built our business on a foundation of trust and integrity. Unlike other <em>used car dealers in Eugene</em>, you won't find high-pressure sales tactics or hidden fees here. What you will find is a friendly team of automotive professionals dedicated to helping you find the perfect used truck, SUV, or sedan to fit your lifestyle and budget.
            </p>
            <div className="pt-6 mt-10">
              <h2 className="text-3xl font-bold text-[#002B60]">Our Commitment to Oregon Drivers</h2>
              <ul className="mt-6 space-y-4 list-disc list-inside">
                <li><strong className="font-semibold text-gray-800">Locally Sourced Inventory:</strong> We hand-pick every vehicle to ensure it meets our high standards for reliability, perfect for Pacific Northwest driving conditions.</li>
                <li><strong className="font-semibold text-gray-800">Bad Credit & No Credit Financing:</strong> We understand that financing can be a major hurdle. Our experienced finance team works with a wide network of lenders to secure competitive auto loans for all credit situations. We specialize in helping Eugene residents get approved.</li>
                <li><strong className="font-semibold text-gray-800">Customer-Focused Service:</strong> Your satisfaction is our top priority. From the moment you browse our inventory online to the day you drive off our lot, we're here to provide support. We're not just selling cars; we're building lasting relationships with our neighbors in the Willamette Valley.</li>
              </ul>
            </div>
            <p>
              Thank you for considering Pacific Cars and Trucks for your next vehicle purchase. We look forward to welcoming you to our dealership in Eugene and helping you find your next great ride!
            </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;