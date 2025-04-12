'use client';

import { Map } from '@/map/Map';
import { Navbar } from '@/layout/Navbar';
import Footer from '@/layout/Footer';

export default function MapPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Map />
      <Footer />
    </div>
  );
} 