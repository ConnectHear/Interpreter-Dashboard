process.env.TZ = 'Asia/Karachi';

const express = require('express');
const { onRequest } = require('firebase-functions/v2/https');
const app = require('./app');

// Cloud Functions v2 strips the function name from req.url before Express sees it.
// App routes are mounted at /api/*, so re-prepend /api for all incoming requests.
const wrapper = express();
wrapper.use((req, _res, next) => {
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url === '/' ? '' : req.url);
    }
    next();
});
wrapper.use(app);

exports.api = onRequest(
    {
        region: 'us-central1',
        vpcConnector: 'mysql-connector',
        vpcConnectorEgressSettings: 'ALL_TRAFFIC',
        timeoutSeconds: 60,
        memory: '512MiB',
        minInstances: 0,
        maxInstances: 10,
    },
    wrapper
);
