const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

connectDB();

// Ensure existing PG documents have `totalRooms` set (migrate from legacy `availableRooms`)
(async () => {
	try {
		const PG = require('./models/PG');
		const Room = require('./models/Room');
		const User = require('./models/User');
		const bcrypt = require('bcrypt');

		// Clean up old legacy admin user if it exists
		const oldAdmin = await User.findOne({ email: 'admin@pggg.test' });
		if (oldAdmin) {
			await User.deleteOne({ email: 'admin@pggg.test' });
			console.log('✓ Cleaned up legacy admin user: admin@pggg.test');
		}

		// Create/ensure standard admin user
		let admin = await User.findOne({ email: 'admin@pgheaven.com' });
		if (!admin) {
			const adminHash = await bcrypt.hash('pgheaven@123', 10);
			admin = await User.create({
				name: 'Admin',
				email: 'admin@pgheaven.com',
				password: adminHash,
				role: 'admin',
			});
			console.log('✓ Admin user created: admin@pgheaven.com');
		} else if (admin.role !== 'admin') {
			// Fix role if it's not admin
			admin.role = 'admin';
			await admin.save();
			console.log('✓ Admin role fixed: admin@pgheaven.com');
		}

		const list = await PG.find({});
		if (list && list.length) {
			for (const pg of list) {
				const avail = (pg.availableRooms != null) ? pg.availableRooms : 1;
				pg.totalRooms = avail;
				// keep availableRooms within bounds
				pg.availableRooms = Math.min(avail, pg.totalRooms);
				await pg.save();

				// Create Room documents if missing
				const existingRooms = await Room.find({ pg: pg._id }).countDocuments();
				const toCreate = Math.max(0, pg.totalRooms - existingRooms);
				if (toCreate > 0) {
					const rooms = [];
					for (let i = existingRooms + 1; i <= pg.totalRooms; i++) {
						rooms.push({ pg: pg._id, roomNumber: `Room ${i}`, pricePerDay: pg.price || 0 });
					}
					await Room.insertMany(rooms);
					console.log(`Room migration: created ${toCreate} rooms for PG ${pg._id}`);
				}
			}
			console.log(`PG migration: processed ${list.length} documents`);
		}
	} catch (err) {
		console.error('PG migration failed:', err.message || err);
	}
})();

// Routes
app.use('/api/auth', require('./routes/auth'));
// PG routes (plural) - keep existing
app.use('/api/pgs', require('./routes/pg'));
// Backwards-compatible PG route (singular) used by some clients/tests
app.use('/api/pg', require('./routes/pg'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/services', require('./routes/service'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/complaints', require('./routes/complaint'));
// Payments
app.use('/api/payments', require('./routes/payment'));
// Menu
app.use('/api/menu', require('./routes/menu'));

// Simple root endpoint to confirm API is running
app.get('/', (req, res) => res.send('PG Rental API is running. Use /api/* endpoints'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
	process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection:', reason);
	process.exit(1);
});
