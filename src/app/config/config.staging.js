const config = {
    url: 'https://mlsms-v2-integration.herokuapp.com',
    api: 'https://mlsms-v2-integration.herokuapp.com/api',
    staticUrl: 'https://monlivresms-public.s3.eu-central-1.amazonaws.com/',
    port: process.env.PORT || 8000,
    application: {
        name: 'Mon Livre SMS',
    },
};

export default config;
