const axios = require('axios');
const { JWT } = require('google-auth-library');
const keys = require('./noti.json');

async function sendNotification() {
    try {
        const accessToken = await getAccessToken();
        console.log("*************************************************",accessToken);

        const response = await axios.post(
            `https://fcm.googleapis.com/v1/projects/${keys.project_id}/messages:send`,
            {
                message: {
                    topic: "all",
                    notification: {
                        title: "Test Notification", // Replace 'test' with a valid string
                        body: "This is a test notification", // Replace 'testing' with a valid string
                    },
                    data: {
                        click_action: "FLUTTER_NOTIFICATION_CLICK",
                        id: "1",
                        status: "done"
                    }
                }
                
            },
            {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`dmessaese f   vgdfgsdhgsd %%%%%%%%%%%%%%%%%%%%%%%%% ${JSON.stringify(message)}`);
        console.log('Notification sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending notification:', error.response?.data || error.message);
        throw error;
    }
}

const getAccessToken = async function () {
    return new Promise((resolve, reject) => {
        const jwtClient = new JWT({
            email: keys.client_email,
            key: keys.private_key,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        jwtClient.authorize((err, tokens) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
};

 async function sendNotificationToUserDevice(message, deviceToken, title = null) {
    console.log('Sending notification' , message);
    console.log('Sending notification', deviceToken);
    console.log('Sending notification', title);

    try {
        const accessToken = await getAccessToken(); 
        const response = await axios.post(
            `https://fcm.googleapis.com/v1/projects/${keys.project_id}/messages:send`,
            {
                message: {
                    token: deviceToken,
                    notification: {
                        title: title || "Congratulations", 
                        body: message,
                    },
                    data: {
                        click_action: "FLUTTER_NOTIFICATION_CLICK",
                        id: "1",
                        status: "done",
                    }
                }
            },
            {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Notification sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending notification:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { sendNotification, sendNotificationToUserDevice };