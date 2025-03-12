'use client';

import { useState } from 'react';
import { MapPinIcon, ClipboardDocumentListIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import PackingList from '@/components/PackingList';
import { PackingList as PackingListType } from '@/types/packing';

export default function Home() {
  const [tripDetails, setTripDetails] = useState({
    startDate: '',
    endDate: '',
    location: '',
    activities: '',
    gender: '',
    priceRange: '',
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

  // Helper function to determine season from date
  const getSeason = (date: string) => {
    if (!date) return '';
    const month = new Date(date).getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
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
            {/* Trip Duration Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Duration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="block text-base font-medium text-gray-700 flex items-center">
                    Start Date
                    {tripDetails.startDate && (
                      <span className="ml-2 text-sm text-gray-500">({getSeason(tripDetails.startDate)})</span>
                    )}
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
                  <label htmlFor="endDate" className="block text-base font-medium text-gray-700 flex items-center">
                    End Date
                    {tripDetails.endDate && (
                      <span className="ml-2 text-sm text-gray-500">({getSeason(tripDetails.endDate)})</span>
                    )}
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
            </div>

            {/* Location Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Destination</h2>
              <div className="space-y-2">
                <label htmlFor="location" className="block text-base font-medium text-gray-700">
                  Destination
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    className="block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors"
                    placeholder="e.g., Paris, France"
                    value={tripDetails.location}
                    onChange={(e) => setTripDetails({ ...tripDetails, location: e.target.value })}
                  />
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <MapPinIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-base font-medium text-gray-700 flex items-center">
                    Gender
                    <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                    <div className="group relative ml-2">
                      <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                      <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-900 text-white text-sm rounded-md -right-2 transform translate-x-full">
                        Helps us tailor clothing and accessory recommendations
                      </div>
                    </div>
                  </label>
                  <div className="mt-1 relative">
                    <select
                      name="gender"
                      id="gender"
                      className="block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors"
                      value={tripDetails.gender}
                      onChange={(e) => setTripDetails({ ...tripDetails, gender: e.target.value })}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="priceRange" className="block text-base font-medium text-gray-700 flex items-center">
                    Price Range
                    <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                    <div className="group relative ml-2">
                      <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                      <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-900 text-white text-sm rounded-md -right-2 transform translate-x-full">
                        Helps us suggest products within your budget
                      </div>
                    </div>
                  </label>
                  <div className="mt-1 relative">
                    <select
                      name="priceRange"
                      id="priceRange"
                      className="block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors"
                      value={tripDetails.priceRange}
                      onChange={(e) => setTripDetails({ ...tripDetails, priceRange: e.target.value })}
                    >
                      <option value="">Select price range</option>
                      <option value="budget">Budget-friendly</option>
                      <option value="mid-range">Mid-range</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities Section */}
            <div>
              <label htmlFor="activities" className="block text-base font-medium text-gray-700 flex items-center">
                Planned Activities
                <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                <div className="group relative ml-2">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                  <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-gray-900 text-white text-sm rounded-md -right-2 transform translate-x-full">
                    List your planned activities to get more specific recommendations
                  </div>
                </div>
              </label>
              <div className="mt-1 relative">
                <textarea
                  name="activities"
                  id="activities"
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base transition-colors"
                  placeholder="e.g., Hiking, Swimming, Sightseeing, Fashion Week events"
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
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Packing List'
                )}
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
