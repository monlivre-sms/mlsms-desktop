const config = {
    url: 'http://localhost:8000',
    api: 'http://localhost:8000/api',
    staticUrl: 'https://monlivresms-public.s3.eu-central-1.amazonaws.com/',
    port: process.env.PORT || 8000,
    application: {
        name: 'Mon Livre SMS',
    },
};

export default config;
