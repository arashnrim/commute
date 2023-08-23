import { MongoClient } from "mongodb";
import axios from "axios";
import { devStrings } from "../strings.js";

if (!process.env.MONGO_URI) {
  throw devStrings.noMongoURI;
}
const client = new MongoClient(process.env.MONGO_URI);

const parseInput = async (args) => {
  try {
    await client.connect();

    // Checks the bus service
    const service = args[args.length - 1];
    const database = client.db("commute_db");
    const servicesCollection = database.collection("bus_services");
    const serviceResult = await servicesCollection.findOne({
      ServiceNo: { $eq: service.toUpperCase() },
    });

    if (!serviceResult) {
      return "SERVICE_NOT_FOUND";
    }

    const stopsCollection = database.collection("bus_stops");
    if (!isNaN(parseInt(args[0]))) {
      // Checks the bus stop code
      const code = args[0];
      const stopResult = await stopsCollection.findOne({
        BusStopCode: { $eq: code },
      });
      if (!stopResult) {
        return "STOP_NOT_FOUND";
      }
    } else {
      // Retrieves a list of bus stops along the given road
      const road = args
        .slice(0, -1)
        .map((part) => (part = part[0].toUpperCase() + part.slice(1)))
        .join(" ");
      const stopsResult = await stopsCollection.find({
        RoadName: { $eq: road },
      });
      const stops = await stopsResult.toArray();
      if (!stops) {
        return "ROAD_NOT_FOUND";
      }

      return stops;
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

const getArrivalTimings = async (stop, service) => {
  if (!process.env.ACCOUNT_KEY) {
    throw devStrings.noDataMallKey;
  }

  const response = await axios.get(
    `http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${stop}&ServiceNo=${service}`,
    {
      headers: {
        AccountKey: process.env.ACCOUNT_KEY,
      },
    }
  );

  const data = response.data.Services;
  if (data.length === 0) return data;
  const arrivals = [data[0].NextBus, data[0].NextBus2, data[0].NextBus3];
  return arrivals;
};

const displayArrivalTimings = (arrivals) => {
  if (arrivals.length === 0) {
    return [];
  } else {
    var estimates = [];
    const currentTime = new Date();

    for (const arrival of arrivals) {
      const difference =
        new Date(arrival.EstimatedArrival).valueOf() - currentTime.valueOf();
      const estimate = Math.floor(difference / 1000 / 60);
      if (estimate >= 0) {
        estimates.push(
          `Estimated arrival: *${estimate} min* \\(${new Date(
            arrival.EstimatedArrival
          ).toLocaleTimeString("en-SG", {
            hour12: true,
            hour: "numeric",
            minute: "numeric",
            timeZone: "Asia/Singapore",
          })}\\)`
        );
      }
    }

    return estimates;
  }
};

export { parseInput, getArrivalTimings, displayArrivalTimings };
