import React from 'react';
import Logo from '../components/Logo';

const Join = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h1 className="text-2xl font-bold text-dark mt-6">Join the Queue</h1>
            <p className="text-gray-500 mt-2">Customer join page will be implemented here</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-center text-gray-400">
              This page will allow customers to:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✓ Enter their phone number</li>
              <li>✓ Select a service type</li>
              <li>✓ Receive queue number</li>
              <li>✓ Track queue status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Join;