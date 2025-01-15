import express from "express";
import axios from "axios";
import responseTime from "response-time";
import { createClient } from "redis";

const app = express();
const client = createClient({
  host: "127.0.0.1",
  port: 6379,
});

app.use(responseTime());
app.get("/characters", async (req, res) => {
  // Try to get the data from Redis store
  const reply = await client.get("characters");
  if (reply) {
    console.log("using cache");
    return res.json(JSON.parse(reply));
  }

  // Fetch data from the Rick and Morty API
  const { data } = await axios.get("https://rickandmortyapi.com/api/character");

  // Save the API response in Redis store
  const saveResult = await client.set("characters", JSON.stringify(data));
  console.log("using API", saveResult);

  return res.json(data);
});

const main = async () => {
  await client.connect(); // Connect to Redis server
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};

main();
