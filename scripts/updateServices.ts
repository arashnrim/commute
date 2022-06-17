import { MongoClient } from "mongodb";
import "dotenv/config";
import axios from "axios";
import { exit } from "process";
import { devStrings } from "../src/strings";

interface Service {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  Category: string;
  OriginCode: string;
  DestinationCode: string;
  AM_Peak_Freq: string;
  AM_Offpeak_Freq: string;
  PM_Peak_Freq: string;
  PM_Offpeak_Freq: string;
  LoopDesc: string;
}

const getServices = async () => {
  if (!process.env.ACCOUNT_KEY) {
    throw devStrings.noDataMallKey;
  }

  console.info("Fetching list of bus stops from the LTA...");
  var services: Array<Service> = [];
  var skip = 0;
  var repeat = true;
  while (repeat) {
    const response = await axios.get(
      `http://datamall2.mytransport.sg/ltaodataservice/BusServices?$skip=${skip}`,
      {
        headers: {
          AccountKey: process.env.ACCOUNT_KEY,
        },
      }
    );

    const responseServices = response.data.value;
    if (responseServices.length === 0) {
      repeat = false;
    } else {
      services = services.concat(responseServices);
      skip += 500;
    }
  }

  return services;
};

const updateDatabase = async (services: Service[]) => {
  if (!process.env.MONGO_URI) {
    throw devStrings.noMongoURI;
  }

  const client = new MongoClient(process.env.MONGO_URI);
  try {
    // Adds the retrieved stops to the database
    console.info("Updating MongoDB database...");
    await client.connect();

    const database = client.db("commute_db");
    const servicesCollection = database.collection("bus_services");

    for (const service of services) {
      await servicesCollection.replaceOne(
        { ServiceNo: { $eq: service.ServiceNo } },
        service,
        { upsert: true }
      );
    }
  } finally {
    console.info("Update complete!");
    await client.close();
    return;
  }
};

getServices().then((services) => {
  console.info(`Retrieved! Found ${services.length} bus services.`);

  updateDatabase(services).then(() => {
    console.info("Exiting...");
    exit();
  });
});
