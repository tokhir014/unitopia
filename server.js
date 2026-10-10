const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); // JSON formatdagi ma'lumotlarni o'qish uchun

// MongoDB Atlas (Bulutli Baza) ulanish havolasi
const DB_URI = 'mongodb+srv://tohirjonorazaliyev_db_user:sfGzd9vQaXVQkieA@cluster0.ogm9axk.mongodb.net/my_app_db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DB_URI)
  .then(() => console.log('✅ MongoDB Atlas bulutli bazasiga muvaffaqiyatli ulandi!'))
  .catch((err) => console.error('❌ Bazaga ulanishda xatolik:', err));

// Foydalanuvchi sxemasi (Coin va Chat xabarlari bilan)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  coins: { type: Number, default: 0 },
  messages: [String]
});

const User = mongoose.model('User', UserSchema);

// 1. Bosh sahifa
app.get('/', (req, res) => {
  res.send('Bulutli Baza Serveri va Chat ishlayapti!');
});

// 2. Barcha foydalanuvchilar va ularning ma'lumotlarini ko'rish
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Brauzerdan turib test uchun chat va coin qo'shish
app.get('/test-send', async (req, res) => {
  try {
    let user = await User.findOne({ username: 'Zahida' });
    
    if (!user) {
      user = new User({ username: 'Zahida', coins: 100, messages: ['Salom Atlas!'] });
    } else {
      user.coins += 50; // Har safar kirsangiz 50 coin qo'shiladi
      user.messages.push('Bulutga yangi xabar: ' + new Date().toLocaleTimeString());
    }
    
    await user.save();
    res.json({ success: true, message: 'Bulutli baza yangilandi!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Yangi xabar yuborish (POST so'rovlar uchun)
app.post('/send-message', async (req, res) => {
  try {
    const { username, message } = req.body;
    
    let user = await User.findOne({ username });
    
    if (!user) {
      user = new User({ username, coins: 50, messages: [message] });
    } else {
      user.messages.push(message);
    }
    
    await user.save();
    res.json({ success: true, message: 'Xabar bulutga saqlandi!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Coin balansini o'zgartirish (qo'shish/ayirish)
app.post('/update-coins', async (req, res) => {
  try {
    const { username, coinAmount } = req.body;
    
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi!' });
    }
    
    user.coins += coinAmount;
    await user.save();
    
    res.json({ success: true, newBalance: user.coins, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serverni 5000-portda ishga tushirish
app.listen(5000, () => {
  console.log('🚀 Server http://localhost:5000 manzilida ishga tushdi');
});