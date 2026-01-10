export default () => ({
  database: {
    uri: process.env.MONGO_URI,
  },
  apiHost: process.env.API_HOST,
  redis: process.env.REDIS_URI,
  redis_queue: process.env.REDIS_QUEUE_URI,
});
