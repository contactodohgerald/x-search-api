import router from './router.js';

const handleRoutes = (app) => {
    app.use('/api/v1/', router);
}

export default handleRoutes;