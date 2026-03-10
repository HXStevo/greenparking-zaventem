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

                res.status(200).send(`<!DOCTYPE html>
<html>
<body>
<script>
(function() {
    function sendMessage(message) {
        if (window.opener) {
            window.opener.postMessage(message, '*');
            window.close();
        }
    }
    sendMessage('${content}');
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
