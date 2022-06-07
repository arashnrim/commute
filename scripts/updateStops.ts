import { MongoClient } from "mongodb";
import "dotenv/config";
import axios from "axios";
import { exit } from "process";

interface Stop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
}

const getStops = async () => {
  if (!process.env.ACCOUNT_KEY) {
    throw "DataMall account key not found. Please enter it as an environment variable!";
  }

  console.info("Fetching list of bus stops from the LTA...");
  var stops: Array<Stop> = [];
  var skip = 0;
  var repeat = true;
  while (repeat) {
    const response = await axios.get(
      `http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`,
      {
        headers: {
          AccountKey: process.env.ACCOUNT_KEY,
        },
      }
    );

    const responseStops = response.data.value;
    if (responseStops.length === 0) {
      repeat = false;
    } else {
      stops = stops.concat(responseStops);
      skip += 500;
    }
  }

  return stops;
};

const updateDatabase = async (stops: Stop[]) => {
  if (!process.env.MONGO_URI) {
    throw "MongoDB URI not found. Please enter it as an environment variable!";
  }

  const client = new MongoClient(process.env.MONGO_URI);
  try {
    // Adds the retrieved stops to the database
    console.info("Updating MongoDB database...");
    await client.connect();

    const database = client.db("commute_db");
    const stopsCollection = database.collection("bus_stops");

    for (const stop of stops) {
      await stopsCollection.replaceOne(
        { BusStopCode: { $eq: stop.BusStopCode } },
        stop,
        { upsert: true }
      );
    }
  } finally {
    console.info("Update complete!");
    await client.close();
    return;
  }
};

getStops().then((stops) => {
  console.info(`Retrieved! Found ${stops.length} bus stops.`);

  updateDatabase(stops).then(() => {
    console.info("Exiting...");
    exit();
  });
});
