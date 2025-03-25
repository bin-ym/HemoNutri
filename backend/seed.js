const User = require('./models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hemonutri', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const seedUsers = async () => {
  try {
    // Hash passwords
    const hanaPassword = await bcrypt.hash('12@21_hana', 10);
    const hamerekalPassword = await bcrypt.hash('1212@hamerekal', 10);
    const elbetelPassword = await bcrypt.hash('1234@elbetel', 10);

    // Define users
    const users = [
      {
        _id: new mongoose.Types.ObjectId('67da95f5d573ea7ed1065227'),
        username: 'Hamerekal Sendeku',
        email: 'hamerekal.sendeku@aastu.edu.et', // Standardized to lowercase
        password: hamerekalPassword,
        role: 'patient',
      },
      {
        _id: new mongoose.Types.ObjectId('67daa064de7ed9cd6c2e455c'),
        username: 'Elbetel Shineda',
        email: 'elbetel.shineda@aastu.edu.et',
        password: elbetelPassword,
        role: 'provider',
      },
      {
        username: 'Hana Ashiro',
        email: 'hana.ashiro@aastu.edu.et',
        password: hanaPassword,
        role: 'admin',
      },
    ];

    // Clear existing users with these emails or usernames
    await User.deleteMany({
      $or: [
        { 
          email: { 
            $in: [
              'hamerekal.sendeku@aastu.edu.et', 
              'elbetel.shineda@aastu.edu.et', 
              'hana.ashiro@aastu.edu.et'
            ] 
          } 
        },
        { 
          username: { 
            $in: ['Hamerekal Sendeku', 'Elbetel Shineda', 'Hana Ashiro'] 
          } 
        },
      ],
    });

    // Insert new users
    await User.insertMany(users);
    console.log('Users seeded successfully:');
    console.log(users.map(u => ({
      username: u.username,
      email: u.email,
      role: u.role,
    })));
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();