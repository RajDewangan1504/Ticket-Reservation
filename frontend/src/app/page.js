"use client"
import { useEffect, useState } from 'react';

export default function Home() {
  const [seats, setSeats] = useState([]);
  const [numSeats, setNumSeats] = useState(1);
  const [bookingMessage, setBookingMessage] = useState('');

  // Fetch the seat data using fetch API
  const fetchSeats = async () => {
    try {
      const response = await fetch('http://localhost:3001/view-seats');
      const data = await response.json();
      setSeats(data);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  // Handle seat booking using fetch API
  const handleBooking = async () => {
    try {
      const response = await fetch('http://localhost:3001/book-seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numSeats: parseInt(numSeats) }),
      });
      const data = await response.json();
      setBookingMessage(data.message);
      fetchSeats(); // Refresh the seat status after booking
    } catch (error) {
      console.error('Error booking seats:', error);
    }
  };

  // Handle seat reset using fetch API
  const handleReset = async () => {
    try {
      const response = await fetch('http://localhost:3001/reset-seats', {
        method: 'POST',
      });
      const data = await response.json();
      setBookingMessage(data.message);
      fetchSeats(); // Refresh the seat status after reset
    } catch (error) {
      console.error('Error resetting seats:', error);
    }
  };

  // Fetch seats on page load
  useEffect(() => {
    fetchSeats();
  }, []);

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Train Seat Booking System</h1>

      <div className="flex justify-center items-center mb-6">
        <label className="text-lg mr-4 font-medium">Number of seats to book:</label>
        <input
          type="number"
          className="w-16 p-2 border-2 border-gray-300 rounded-lg text-center text-black"
          value={numSeats}
          onChange={(e) => setNumSeats(e.target.value)}
          min="1"
          max="7"
        />
        <button
          onClick={handleBooking}
          className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Book Seats
        </button>
      </div>

      {bookingMessage && (
        <p className="text-center text-lg text-green-600 mb-6">{bookingMessage}</p>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-center mb-4">Seat Availability</h3>
        <div className="grid grid-cols-7 gap-4 mx-auto max-w-xl">
          {seats.map((seat) => (
            <div
              key={seat.seatNumber}
              className={`p-4 text-white text-center rounded-lg ${
                seat.booked ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {seat.seatNumber}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition duration-300"
        >
          Reset All Seats
        </button>
      </div>
    </div>
  );
}
