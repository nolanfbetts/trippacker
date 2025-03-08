'use client';

import { useState } from 'react';
import { MapPinIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import PackingList from '@/components/PackingList';
import { PackingList as PackingListType } from '@/types/packing';

export default function Home() {
  const [tripDetails, setTripDetails] = useState({
    startDate: '',
    endDate: '',
    location: '',
    activities: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [packingList, setPackingList] = useState<PackingListType | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate-packing-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripDetails),
      });
      
      const data = await response.json();
      setPackingList(data);
    } catch (error) {
      console.error('Error generating packing list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">TripPacker</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate your perfect packing list for any trip
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 backdrop-blur-sm backdrop-filter">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-base font-semibold text-gray-900">
                  Start Date
                </label>
                <div className="mt-1 relative">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    className="block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors appearance-none"
                    value={tripDetails.startDate}
                    onChange={(e) => setTripDetails({ ...tripDetails, startDate: e.target.value })}
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-base font-semibold text-gray-900">
                  End Date
                </label>
                <div className="mt-1 relative">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    required
                    className="block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors appearance-none"
                    value={tripDetails.endDate}
                    onChange={(e) => setTripDetails({ ...tripDetails, endDate: e.target.value })}
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-base font-semibold text-gray-900">
                Destination
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="location"
                  id="location"
                  required
                  className="block w-full rounded-lg border-gray-300 py-3 px-4 pr-12 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors"
                  placeholder="e.g., Paris, France"
                  value={tripDetails.location}
                  onChange={(e) => setTripDetails({ ...tripDetails, location: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="activities" className="block text-base font-semibold text-gray-900">
                Planned Activities (Optional)
              </label>
              <div className="mt-1 relative">
                <textarea
                  name="activities"
                  id="activities"
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors"
                  placeholder="e.g., Hiking, Swimming, Sightseeing"
                  value={tripDetails.activities}
                  onChange={(e) => setTripDetails({ ...tripDetails, activities: e.target.value })}
                />
                <div className="absolute top-3 right-3 pointer-events-none">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Packing List'}
              </button>
            </div>
          </form>
        </div>

        {packingList && (
          <div className="mt-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Packing List</h2>
            <PackingList categories={packingList.categories} />
          </div>
        )}
      </div>
    </main>
  );
}
