module.exports = (req, res) => {
    const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

    if (!clientId) {
        res.status(500).send('OAUTH_GITHUB_CLIENT_ID environment variable not set');
        return;
    }

    const scope = 'repo,user';
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}`;

    res.redirect(url);
};
