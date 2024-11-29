import Head from 'next/head';
import { useState } from 'react';
import Image from 'next/image'
import Sidebar from '../components/Sidebar';
import Maincontent from '../components/Maincontent';
import AccountHeader from '../components/Account';
export default function Home() {
  const [mode, setMode] = useState('balanced');

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <Sidebar mode={mode} setMode={setMode} />
      {/* Main content */}
      <Maincontent />
    </div>
  );
}