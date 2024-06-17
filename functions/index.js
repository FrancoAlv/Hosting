    const functions = require("firebase-functions");
    const admin = require("firebase-admin");
    const axios = require("axios");

    admin.initializeApp();

    exports.createPaymentOrder = functions.https.onCall(async (data, context) => {
        const {amount, description, email, phone} = data;
        const userId = context.auth.uid;
        const orderId = `${userId}-${Date.now()}`;

        if (!userId) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "User must be authenticated to create a payment order"
            );
        }

        const username = '38745500';
        const password = 'testpassword_3FY9B9EdVYFGZbODOrPjXaRut7loay8wMrs9VxnQmIcku';
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');

        try {
            const response = await axios.post(
                "https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment",
                {
                    amount: amount,
                    currency: "PEN",
                    orderId: orderId,
                    customer: {
                        id: userId,
                        email: email,
                        phone: phone,
                    },
                    billing: {
                        address: "Dirección de facturación",
                        city: "Ciudad",
                        country: "PER",
                    },
                    shipping: {
                        address: "Dirección de envío",
                        city: "Ciudad",
                        country: "PER",
                    },
                    channelDetails: {
                        channelType: "QR"
                    }
                },
                {
                    headers: {
                        "Authorization": `Basic ${credentials}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error creating payment order:", error.response ? error.response.data : error.message);
            throw new functions.https.HttpsError(
                "internal",
                "Error creating payment order",
                error
            );
        }
    });
