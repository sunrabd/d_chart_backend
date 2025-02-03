const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const marketTypeRoutes = require('./routes/market_type_route');
const liveResultRoutes = require('./routes/live_result_route');
const { sequelize } = require('./config/db');
const path = require('path'); 
const gameTypeRoutes = require('./routes/game_type_route');
const AddGuessRoutes = require('./routes/guess_controller_route');
const userRoutes = require('./routes/user_route');
const aiGuessRoutes = require('./routes/ai_guess_route');
const checkloadRoutes = require('./routes/load_check_route');
const winnerRoutes = require('./routes/winner_route.');
const adminSettingRoutes = require('./routes/setting_route');
const videoRoutes = require('./routes/add_video_route');
const globalNotificationRoutes = require('./routes/global_notification_route');
const subscriptionRoutes = require('./routes/subscription_route');
const skillpayRoutes = require('./routes/skillpay_route');
const addvertisementRoutes = require('./routes/advertisement_route');
const transactionRoutes = require('./routes/transaction_routes');
const socialMediaRoutes = require('./routes/social_media_route');
const couponRoutes = require('./routes/coupon_route');
const subscriptionHistoryRoutes = require('./routes/subscription_history_route');
const superCoinRoute = require('./routes/super_coin_route');
const coinRoutes = require('./routes/coin_route');
const paymentFailedRoutes = require('./routes/payment_failed_route');
const tickerRoutes = require('./routes/ticker_routes');


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/d-chart', liveResultRoutes);
app.use('/api/d-chart', marketTypeRoutes);
app.use('/api/d-chart', gameTypeRoutes);
app.use('/api/d-chart', AddGuessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/liveresults', aiGuessRoutes);
app.use('/api/d-chart', checkloadRoutes);
app.use('/api/d-chart', winnerRoutes);
app.use('/api/admin-settings', adminSettingRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/d-chart/notifications', globalNotificationRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', skillpayRoutes);
app.use('/api',addvertisementRoutes);
app.use('/transactions', transactionRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/subscription-history', subscriptionHistoryRoutes);
app.use('/api/super-coin', superCoinRoute);
app.use('/api/coins', coinRoutes);
app.use('/api', paymentFailedRoutes);
app.use('/api', tickerRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}).catch(err => console.error('Database connection error:', err));
