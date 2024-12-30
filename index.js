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

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}).catch(err => console.error('Database connection error:', err));
