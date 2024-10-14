const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 9010;

// MongoDB connection
mongoose.connect( 'mongodb+srv://swayamkumarkarn:swayamkumarkarn@cluster0.regs5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/trainSeats',).then(() => console.log('Connected to MongoDB')).catch(err => console.log(err));

const seatSchema = new mongoose.Schema({
  seatNumber: Number,
  booked: Boolean,
});

const Seat = mongoose.model('Seat', seatSchema);

// Initialize seat data (run only once)
app.get('/initialize-seats', async (req, res) => {
  try {
    const seatsExist = await Seat.find();
    if (seatsExist.length === 0) {
      for (let i = 1; i <= 80; i++) {
        await Seat.create({ seatNumber: i, booked: false });
      }
      return res.status(200).send('Seats initialized');
    } else {
      return res.status(400).send('Seats already initialized');
    }
  } catch (error) {
    console.error('Error initializing seats:', error);
    return res.status(500).send('Error initializing seats');
  }
});

// Find and book seats function
const findAndBookSeats = async (numSeats) => {
  let bookedSeats = [];

  // Try to book seats in the same row
  for (let i = 0; i < 80; i += 7) {
    let rowSeats = await Seat.find({ seatNumber: { $gte: i + 1, $lte: i + 7 }, booked: false });
    if (rowSeats.length >= numSeats) {
      for (let j = 0; j < numSeats; j++) {
        rowSeats[j].booked = true;
        await rowSeats[j].save();
        bookedSeats.push(rowSeats[j].seatNumber);
      }
      return bookedSeats;
    }
  }

  // Book the nearest available seats if no row has enough free seats
  const availableSeats = await Seat.find({ booked: false }).limit(numSeats);
  if (availableSeats.length === numSeats) {
    for (let seat of availableSeats) {
      seat.booked = true;
      await seat.save();
      bookedSeats.push(seat.seatNumber);
    }
  }
  return bookedSeats;
};

// API to book seats
app.post('/book-seats', async (req, res) => {
  const { numSeats } = req.body;

  if (numSeats > 7 || numSeats < 1) {
    return res.status(400).json({ message: 'You can only book between 1 and 7 seats at a time.' });
  }

  try {
    let bookedSeats = await findAndBookSeats(numSeats);
    console.log("Seats booked:", bookedSeats);  // Debugging log

    if (bookedSeats.length === numSeats) {
      return res.status(200).json({
        message: `Successfully booked ${numSeats} seats.`,
        seats: bookedSeats,
      });
    } else {
      return res.status(400).json({ message: 'Not enough seats available.' });
    }
  } catch (error) {
    console.error("Booking error:", error);  // Debugging log
    return res.status(500).json({ message: 'Server error during seat booking.' });
  }
});

// API to view seats
app.get('/view-seats', async (req, res) => {
  try {
    const seats = await Seat.find();
    console.log("Fetched seats:", seats);  // Debugging log
    return res.status(200).json(seats);
  } catch (error) {
    console.error("Error fetching seats:", error);  // Debugging log
    return res.status(500).json({ message: 'Error retrieving seats.' });
  }
});

// API to reset seats (reset all seats to available)
app.post('/reset-seats', async (req, res) => {
  try {
    // Set all seats' booked status to false
    await Seat.updateMany({}, { booked: false });
    console.log("All seats reset to available.");
    return res.status(200).json({ message: 'All seats have been reset to available.' });
  } catch (error) {
    console.error("Error resetting seats:", error);  // Debugging log
    return res.status(500).json({ message: 'Error resetting seats.' });
  }
});

// 404 Not Found middleware (must be after all other routes)
app.use((req, res, next) => {
  res.status(404).json({ message: '404 Not Found' });
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
