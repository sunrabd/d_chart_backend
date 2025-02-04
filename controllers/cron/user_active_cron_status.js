const cron = require('node-cron');
const moment = require('moment');
const { Op } = require('sequelize');
const User = require('../../models/user_model');

cron.schedule('0 0 * * *', async () => {
    try {
      const threeDaysAgo = moment().subtract(3, 'days').format('YYYY-MM-DD');
  
      // Find users whose active_date is older than 3 days
      const usersToUpdate = await User.findAll({
        where: {
          active_date: { [Op.lte]: threeDaysAgo },
          is_active: true, // Only update active users
        },
      });
  
      if (usersToUpdate.length > 0) {
        // Update is_active flag to false
        await User.update(
          { is_active: false },
          {
            where: {
              active_date: { [Op.lte]: threeDaysAgo },
              is_active: true,
            },
          }
        );
  
        console.log(`Deactivated ${usersToUpdate.length} users.`);
      } else {
        console.log('No users to deactivate.');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  });
  
  console.log('User status cron job scheduled.');