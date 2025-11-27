
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Button from '../ui/Button';
import { api } from '../../services/api';
import { Vehicle } from '../../types';
import VehicleCard from '../VehicleCard';

interface FinancingResult {
  estimatedMonthlyPayment: number;
  estimatedLoanAmount: number;
  advice: string;
  recommendedVehicleIds: number[];
}

const FinancingPage: React.FC = () => {
  const [income, setIncome] = useState(50000);
  const [creditScore, setCreditScore] = useState('Good (690-719)');
  const [downPayment, setDownPayment] = useState(2000);
  const [loanTerm, setLoanTerm] = useState(60);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinancingResult | null>(null);
  const [inventory, setInventory] = useState<Vehicle[]>([]);

  useEffect(() => {
      api.getVehicles().then(setInventory);
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const schema = {
        type: Type.OBJECT,
        properties: {
          estimatedMonthlyPayment: { type: Type.NUMBER, description: "The calculated monthly payment." },
          estimatedLoanAmount: { type: Type.NUMBER, description: "The total estimated loan amount the user can afford." },
          advice: { type: Type.STRING, description: "Friendly and helpful financial advice for the car buyer." },
          recommendedVehicleIds: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "An array of vehicle IDs from the inventory that fit the user's budget."
          }
        },
        required: ["estimatedMonthlyPayment", "estimatedLoanAmount", "advice", "recommendedVehicleIds"]
      };
      
      const inventoryForPrompt = inventory.map(({ id, make, model, year, price }) => ({ id, make, model, year, price }));

      const prompt = `
        You are an experienced and friendly car financing advisor for a used car dealership.
        A customer has provided their financial details. Your task is to provide a helpful, realistic financial assessment and recommend suitable vehicles from our inventory.

        Customer Details:
        - Annual Income: $${income}
        - Credit Score Category: ${creditScore}
        - Down Payment: $${downPayment}
        - Desired Loan Term: ${loanTerm} months

        Our Current Inventory:
        ${JSON.stringify(inventoryForPrompt)}

        Instructions:
        1. Calculate a realistic "Estimated Loan Amount" the customer could comfortably afford. A good rule of thumb is that the total car payment (principal and interest) should not exceed 10-15% of their monthly gross income. Assume an interest rate based on their credit score (Excellent: 5%, Good: 7%, Fair: 12%, Poor: 18%).
        2. Based on the loan amount, calculate the "Estimated Monthly Payment" for the specified loan term.
        3. Write some brief, encouraging "advice". It should be positive and helpful, acknowledging their financial situation and guiding them toward a smart purchase. For example, mention how their down payment helps, or suggest focusing on cars within their budget.
        4. From the provided inventory, identify vehicles whose price is less than or equal to the (Estimated Loan Amount + Down Payment). Return the list of corresponding vehicle IDs in the "recommendedVehicleIds" array. Only recommend vehicles they can afford.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      
      const jsonStr = response.text.trim();
      const parsedResult = JSON.parse(jsonStr);
      setResult(parsedResult);

    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError("Sorry, we couldn't process your request at this time. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const recommendedVehicles = result ? inventory.filter(v => result.recommendedVehicleIds.includes(v.id)) : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#002B60]"><span className="text-ai-style">AI</span> Financing Advisor</h1>
        <p className="mt-2 text-lg text-gray-600">Get a personalized budget and vehicle recommendations in seconds.</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg border">
          <h2 className="text-2xl font-bold text-[#002B60] mb-6">Your Financial Snapshot</h2>
          <form onSubmit={handleCalculate} className="space-y-6">
            <div>
              <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">Annual Income: ${income.toLocaleString()}</label>
              <input type="range" id="income" min="15000" max="150000" step="1000" value={income} onChange={e => setIncome(Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-2">Down Payment: ${downPayment.toLocaleString()}</label>
              <input type="range" id="downPayment" min="0" max="10000" step="500" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="creditScore" className="block text-sm font-medium text-gray-700">Credit Score</label>
              <select id="creditScore" value={creditScore} onChange={e => setCreditScore(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent">
                <option>Good (690-719)</option>
                <option>Excellent (720+)</option>
                <option>Fair (630-689)</option>
                <option>Poor (&lt;630)</option>
              </select>
            </div>
            <div>
              <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700">Loan Term</label>
              <select id="loanTerm" value={loanTerm} onChange={e => setLoanTerm(Number(e.target.value))} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent">
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
                <option value="72">72 Months</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105">
              {loading ? 'Calculating...' : 'Get My Budget'}
            </Button>
          </form>
        </div>
        
        {/* Results */}
        <div className="sticky top-24">
           <div className="flex items-center justify-center min-h-[400px]">
            {loading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1E63FF] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Our <span className="text-ai-style">AI</span> is crunching the numbers...</p>
              </div>
            )}
            {error && <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {result && !loading && (
              <div className="w-full bg-gradient-to-br from-[#1E63FF] to-[#004ACB] p-8 rounded-xl text-white shadow-2xl animate-pop-in">
                <h2 className="text-2xl font-bold mb-6 text-center">Your Personalized Results</h2>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-white/10 rounded-xl">
                          <p className="text-sm text-white/80 tracking-wide uppercase">Est. Monthly Payment</p>
                          <p className="text-3xl font-bold">${result.estimatedMonthlyPayment.toLocaleString()}</p>
                      </div>
                       <div className="p-4 bg-white/10 rounded-xl">
                          <p className="text-sm text-white/80 tracking-wide uppercase">Est. Loan Amount</p>
                          <p className="text-3xl font-bold">${result.estimatedLoanAmount.toLocaleString()}</p>
                      </div>
                   </div>
                  <div className="mt-6 pt-4 border-t border-white/20">
                     <h3 className="font-semibold text-center mb-2"><span className="text-ai-style bg-white px-1 rounded">AI</span> Advisor's Note</h3>
                     <p className="text-white/90 italic text-center text-sm">"{result.advice}"</p>
                  </div>
                </div>
              </div>
            )}
             {!loading && !result && !error && (
                <div className="text-center p-6 bg-gray-100 text-gray-700 rounded-lg animate-fade-in">
                    <h3 className="font-semibold text-xl">Ready to find your budget?</h3>
                    <p>Fill out the form to get instant, <span className="text-ai-style">AI</span>-powered financing advice and see which vehicles you may qualify for.</p>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {result && recommendedVehicles.length > 0 && (
        <div className="mt-20 animate-slide-up">
          <h2 className="text-3xl font-bold text-center text-[#002B60] mb-8">Vehicles In Your Budget</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recommendedVehicles.map((vehicle, idx) => (
              <div key={vehicle.id} style={{animationDelay: `${idx * 100}ms`}} className="animate-slide-up">
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancingPage;
