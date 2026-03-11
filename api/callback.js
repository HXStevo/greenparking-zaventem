const https = require('https');

module.exports = (req, res) => {
    const code = req.query.code;
    const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
    const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

    if (!code) {
        res.status(400).send('Missing code parameter');
        return;
    }

    if (!clientId || !clientSecret) {
        res.status(500).send('OAuth environment variables not configured');
        return;
    }

    const postData = JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
    });

    const options = {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const token = parsed.access_token;
                const provider = 'github';

                const content = token
                    ? `authorization:${provider}:success:${JSON.stringify({ token, provider })}`
                    : `authorization:${provider}:error:${JSON.stringify(parsed)}`;

                // Escape for safe embedding in single-quoted JS string
                const escaped = content.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

                res.status(200).send(`<!DOCTYPE html>
<html>
<body>
<p>Authentication successful. This window will close automatically...</p>
<script>
(function() {
    var message = '${escaped}';

    // Method 1: window.opener.postMessage (standard popup flow)
    if (window.opener) {
        window.opener.postMessage(message, '*');
        window.close();
        return;
    }

    // window.opener is null (lost during cross-origin GitHub redirect)
    // Use BroadcastChannel and localStorage to relay the token to the admin page

    // Method 2: BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
        var channel = new BroadcastChannel('decap-cms-auth');
        channel.postMessage(message);
    }

    // Method 3: localStorage (triggers storage event in admin page)
    try {
        localStorage.setItem('decap-cms-auth', message);
    } catch(e) {}

    // Close popup after delay to ensure messages are delivered
    setTimeout(function() { window.close(); }, 3000);
})();
</script>
</body>
</html>`);
            } catch (err) {
                res.status(500).send('Failed to parse GitHub response');
            }
        });
    });

    request.on('error', (err) => {
        res.status(500).send('Failed to exchange code for token');
    });

    request.write(postData);
    request.end();
};
