const AuthRoute = require('./authRouter');

const CombineRouter = (app) => {
    app.use('/api/v1/auth/', AuthRoute);
}

module.exports = CombineRouter;