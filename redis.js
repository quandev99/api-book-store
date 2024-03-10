const express = require("express");
const axios = require("axios");
const Redis = require("redis");

const redisUrl = "redis://127.0.0.1:6379";

const redisClient = Redis.createClient(redisUrl);
redisClient.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  await redisClient.connect();
};

connectRedis();
const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  const { key, value } = req.body;
  console.log(req.body);

  const response = await redisClient.set(key, value);

  res.json(response);
});
app.get("/", async (req, res) => {
  const { key } = req.body;

  const value = await redisClient.get(key);

  res.json(value);
});
app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const cachedPost = await redisClient.get(`post-${id}`);

  if (cachedPost) {
    return res.json(JSON.parse(cachedPost));
  }

  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );

  await redisClient.set(`post-${id}`, JSON.stringify(response.data), "EX", 10);

  return res.json(response.data);
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
