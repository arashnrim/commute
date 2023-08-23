import axios from "axios";
import "dotenv/config";
import { MongoClient } from "mongodb";
import { devStrings } from "../strings.js";

if (!process.env.MONGO_URI) {
  throw devStrings.noMongoURI;
}

async function getBusServices() {
  try {
    let skip = 0;
    let busServices = [];

    while (true) {
      // Fetch bus services from LTA API
      const response = await axios.get(
        "http://datamall2.mytransport.sg/ltaodataservice/BusServices",
        {
          headers: {
            AccountKey: process.env.ACCOUNT_KEY,
          },
          params: {
            $skip: skip,
          },
        }
      );
      const services = response.data.value;

      if (services.length === 0) {
        break;
      }

      busServices = busServices.concat(services);
      skip += services.length;
    }

    console.log(`Total bus services: ${busServices.length}`);

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const database = client.db("commute_db");
    const servicesCollection = database.collection("bus_services");

    // Insert each bus service as a document in the bus_services collection
    let inserted = 0;
    for (const service of busServices) {
      const result = await servicesCollection.insertOne(service);
      if (result.insertedCount === 1) {
        inserted++;
      }
    }

    console.log(`Inserted ${inserted} bus services into database.`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

async function getBusStops() {
  try {
    let skip = 0;
    let busStops = [];

    while (true) {
      // Fetch bus stops from LTA API
      const response = await axios.get(
        "http://datamall2.mytransport.sg/ltaodataservice/BusStops",
        {
          headers: {
            AccountKey: process.env.ACCOUNT_KEY,
          },
          params: {
            $skip: skip,
          },
        }
      );
      const stops = response.data.value;

      if (stops.length === 0) {
        break;
      }

      busStops = busStops.concat(stops);
      skip += stops.length;
    }

    console.log(`Total bus stops: ${busStops.length}`);

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const database = client.db("commute_db");
    const stopsCollection = database.collection("bus_stops");

    // Insert each bus stop as a document in the bus_stops collection
    let inserted = 0;
    for (const stop of busStops) {
      const result = await stopsCollection.insertOne(stop);
      if (result.insertedCount === 1) {
        inserted++;
      }
    }

    console.log(`Inserted ${inserted} bus stops into database.`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

getBusStops();

export { getBusServices, getBusStops };
