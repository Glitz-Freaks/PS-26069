import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'MausamVani — National Weather Big Data Analytics Platform | Government of India',
  description: 'Official AI-powered real-time meteorological big data and disaster telemetry platform of India Meteorological Department (IMD) & NDMA, Government of India.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f1f5f9] text-[#0f172a] antialiased flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Official Government of India Institutional Footer */}
        <footer className="bg-[#001833] text-slate-200 border-t-4 border-amber-500 mt-12 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-700">
              
              <div>
                <h4 className="text-white font-black text-sm mb-2">MausamVani Portal</h4>
                <p className="text-slate-300 text-xs leading-relaxed font-medium">
                  National Weather Big Data Analytics Platform integrating social media telemetry, regional news, crowdsourced citizen reports, and IMD Doppler ground truth.
                </p>
              </div>

              <div>
                <h4 className="text-white font-black text-sm mb-2">Emergency Response Helplines</h4>
                <ul className="space-y-1.5 text-xs text-slate-200 font-medium">
                  <li className="flex items-center space-x-2">
                    <span className="font-bold text-amber-400">1078:</span>
                    <span>National Disaster Management Authority (NDMA)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="font-bold text-amber-400">1070:</span>
                    <span>National Disaster Response Force (NDRF) Control</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="font-bold text-amber-400">112:</span>
                    <span>National Emergency Response Support System (ERSS)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-black text-sm mb-2">Government Compliance</h4>
                <p className="text-slate-300 text-xs leading-relaxed mb-2 font-medium">
                  Developed in compliance with Guidelines for Indian Government Websites (GIGW) & Digital India.
                </p>
                <span className="inline-block px-3 py-1 rounded bg-[#002b5b] text-xs font-mono font-bold text-amber-300 border border-amber-400/40">
                  Smart India Hackathon (SIH 2026) Initiative
                </span>
              </div>

            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2 font-medium">
              <p>© 2026 Ministry of Earth Sciences • India Meteorological Department (IMD) • Government of India</p>
              <div className="flex space-x-4">
                <span className="hover:text-amber-300 cursor-pointer">Terms of Use</span>
                <span>•</span>
                <span className="hover:text-amber-300 cursor-pointer">Privacy Policy</span>
                <span>•</span>
                <span className="hover:text-amber-300 cursor-pointer">Hyperlink Policy</span>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
