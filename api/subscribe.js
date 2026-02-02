/**
 * Vercel Serverless Function: api/subscribe.js
 * Handles Waitlist signatures and pushes them to MailerLite
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
    }

    const API_KEY = process.env.MAILERLITE_API_KEY;
    const GROUP_ID = process.env.MAILERLITE_GROUP_ID;

    if (!API_KEY || !GROUP_ID) {
        console.error('Missing MailerLite credentials in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(`https://connect.mailerlite.com/api/subscribers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                email: email,
                groups: [GROUP_ID],
                status: 'active' // Add as active subscriber immediately
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('MailerLite API error:', data);
            return res.status(response.status).json({
                error: data.message || 'MailerLite subscription failed'
            });
        }

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
