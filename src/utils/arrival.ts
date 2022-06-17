import { Code, MongoClient } from "mongodb";
import axios from "axios";
import { devStrings } from "../strings";

enum RejectionReason {
  ServiceNotFound = "SERVICE_NOT_FOUND",
  StopNotFound = "STOP_NOT_FOUND",
  RoadNotFound = "ROAD_NOT_FOUND",
}

interface Arrival {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: Date;
  Latitude: number;
  Longitude: number;
  VisitNumber: number;
  Load: string;
  Feature: string;
  Type: string;
}

const parseInput = async (args: string[]) => {
  if (!process.env.MONGO_URI) {
    throw devStrings.noMongoURI;
  }
  const client = new MongoClient(process.env.MONGO_URI);

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
      return RejectionReason.ServiceNotFound;
    }

    const stopsCollection = database.collection("bus_stops");
    if (!isNaN(parseInt(args[0]))) {
      // Checks the bus stop code
      const code = args[0];
      const stopResult = await stopsCollection.findOne({
        BusStopCode: { $eq: code },
      });
      if (!stopResult) {
        return RejectionReason.StopNotFound;
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
        return RejectionReason.RoadNotFound;
      }

      return stops;
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

const fetchArrivalTimings = async (stop: string, service: string) => {
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
  const arrivals: Arrival[] = [
    data[0].NextBus,
    data[0].NextBus2,
    data[0].NextBus3,
  ];
  return arrivals;
};

const displayArrivalTimings = (arrivals: Arrival[]) => {
  if (arrivals.length === 0) {
    return [];
  } else {
    var estimates: string[] = [];
    const currentTime = new Date();

    for (const arrival of arrivals) {
      const difference =
        new Date(arrival.EstimatedArrival).valueOf() - currentTime.valueOf();
      const estimate = Math.floor(difference / 1000 / 60);
      if (estimate >= 0) {
        estimates.push(
          `Estimated arrival: *${estimate} min* (${new Date(
            arrival.EstimatedArrival
          ).toLocaleTimeString("en-SG", {
            hour12: true,
            hour: "numeric",
            minute: "numeric",
            timeZone: "Asia/Singapore",
          })})`
        );
      }
    }

    return estimates;
  }
};

export {
  parseInput,
  RejectionReason,
  fetchArrivalTimings,
  displayArrivalTimings,
};
