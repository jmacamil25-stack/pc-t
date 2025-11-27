import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Button from '../ui/Button';

interface TradeInResult {
  estimatedMinValue: number;
  estimatedMaxValue: number;
  appraiserNotes: string;
}

const TradeInPage: React.FC = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [mileage, setMileage] = useState(50000);
  const [condition, setCondition] = useState('Good');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TradeInResult | null>(null);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const schema = {
        type: Type.OBJECT,
        properties: {
          estimatedMinValue: { type: Type.NUMBER, description: "The low end of the estimated trade-in value range." },
          estimatedMaxValue: { type: Type.NUMBER, description: "The high end of the estimated trade-in value range." },
          appraiserNotes: { type: Type.STRING, description: "Brief, helpful notes from the perspective of an appraiser, explaining the valuation." },
        },
        required: ["estimatedMinValue", "estimatedMaxValue", "appraiserNotes"]
      };

      const prompt = `
        You are an expert used car appraiser for a dealership.
        A customer wants a trade-in value estimate for their vehicle.
        
        Vehicle Details:
        - Make: ${make}
        - Model: ${model}
        - Year: ${year}
        - Mileage: ${mileage.toLocaleString()} miles
        - Condition: ${condition}

        Instructions:
        1.  Based on the provided details, determine a realistic trade-in value range. Provide this as "estimatedMinValue" and "estimatedMaxValue".
        2.  Write brief "appraiserNotes" explaining your valuation. Consider factors like the vehicle's age, mileage, common depreciation for the make/model, and its general condition. Keep the tone professional, fair, and informative. For example, if the mileage is high, you can mention that. If the model holds its value well, mention that too.
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
      setError("We couldn't generate an estimate at this time. Please ensure all fields are filled correctly and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#002B60]">Trade-in Value Estimator</h1>
        <p className="mt-2 text-lg text-gray-600">See what your car is worth with our <span className="text-ai-style">AI</span>-powered tool.</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg border">
          <h2 className="text-2xl font-bold text-[#002B60] mb-6">Tell Us About Your Vehicle</h2>
          <form onSubmit={handleEstimate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make</label>
                  <input type="text" id="make" value={make} onChange={e => setMake(e.target.value)} required placeholder="e.g., Honda" className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent" />
              </div>
              <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                  <input type="text" id="model" value={model} onChange={e => setModel(e.target.value)} required placeholder="e.g., Civic" className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent" />
              </div>
            </div>
             <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
              <input type="number" id="year" value={year} onChange={e => setYear(Number(e.target.value))} required min="1980" max={new Date().getFullYear() + 1} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">Mileage: {mileage.toLocaleString()}</label>
              <input type="range" id="mileage" min="0" max="200000" step="1000" value={mileage} onChange={e => setMileage(Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition</label>
              <select id="condition" value={condition} onChange={e => setCondition(e.target.value)} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent">
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105">
              {loading ? 'Appraising...' : 'Get My Estimate'}
            </Button>
          </form>
        </div>
        
        {/* Results */}
        <div className="flex items-center justify-center min-h-[400px]">
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1E63FF] mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Our <span className="text-ai-style">AI</span> is inspecting your vehicle...</p>
            </div>
          )}
          {error && <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {result && !loading && (
            <div className="w-full bg-gradient-to-br from-[#002B60] to-[#003C8F] p-8 rounded-xl text-white shadow-2xl animate-pop-in">
              <h2 className="text-2xl font-bold mb-6 text-center">Your Trade-in Estimate</h2>
              <div className="space-y-4">
                <div className="p-6 bg-white/10 rounded-xl text-center">
                  <p className="text-sm text-white/80 tracking-wide uppercase">Estimated Value Range</p>
                  <p className="text-4xl font-bold">
                    ${result.estimatedMinValue.toLocaleString()} - ${result.estimatedMaxValue.toLocaleString()}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/20">
                   <h3 className="font-semibold text-center mb-2"><span className="text-ai-style bg-white px-1 rounded">AI</span> Appraiser's Notes</h3>
                   <p className="text-white/90 italic text-center text-sm">"{result.appraiserNotes}"</p>
                </div>
                <p className="text-xs text-white/60 pt-4 text-center">*This is an estimate for informational purposes only. Final value is determined by an in-person inspection.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeInPage;