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

                const tokenEscaped = (token || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                const errorInfo = !token ? JSON.stringify(parsed).replace(/'/g, "\\'") : '';

                res.status(200).send(`<!DOCTYPE html>
<html>
<body>
<p id="status">${token ? 'Authentication successful...' : 'Authentication failed.'}</p>
${!token ? '<p>Error: ' + (parsed.error_description || parsed.error || 'Unknown error') + '</p>' : ''}
<script>
(function() {
    var token = '${tokenEscaped}';
    if (!token) return;

    // Store token directly in Decap CMS auth key
    try {
        localStorage.setItem('netlify-cms-user', JSON.stringify({
            token: token,
            backendName: 'github'
        }));
    } catch(e) {
        document.getElementById('status').textContent = 'Failed to store token: ' + e.message;
        return;
    }

    // Method 1: Try window.opener (standard popup flow)
    if (window.opener) {
        try {
            window.opener.location.reload();
        } catch(e) {}
        window.close();
        return;
    }

    // Method 2: Signal admin page to reload via BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
        var channel = new BroadcastChannel('decap-cms-auth');
        channel.postMessage('reload');
    }

    // Method 3: Signal via localStorage (triggers storage event)
    try {
        localStorage.setItem('decap-cms-auth', 'reload');
    } catch(e) {}

    document.getElementById('status').textContent = 'Logged in! You can close this window and refresh the admin page.';

    // Auto-close after delay
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
