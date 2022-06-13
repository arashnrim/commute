import { MongoClient } from "mongodb";
import axios from "axios";
import { devStrings } from "../strings";

enum RejectionReason {
  ServiceNotFound = "SERVICE_NOT_FOUND",
  StopNotFound = "STOP_NOT_FOUND",
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
  const finalArg = args[args.length - 1];

  if (!process.env.MONGO_URI) {
    throw devStrings.noMongoURI;
  }
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();

    // Checks the bus service
    const database = client.db("commute_db");
    const servicesCollection = database.collection("bus_services");
    const serviceResult = await servicesCollection.findOne({
      ServiceNo: { $eq: finalArg.toUpperCase() },
    });

    if (!serviceResult) {
      return RejectionReason.ServiceNotFound;
    }

    // Checks the bus stop code
    const stopsCollection = database.collection("bus_stops");
    const stopResult = await stopsCollection.findOne({
      BusStopCode: { $eq: args[1] },
    });
    if (!stopResult) {
      return RejectionReason.StopNotFound;
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
  const arrivals: Arrival[] = [
    data[0].NextBus,
    data[0].NextBus2,
    data[0].NextBus3,
  ];
  return arrivals;
};

export { parseInput, RejectionReason, fetchArrivalTimings };
