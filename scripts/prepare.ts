import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const DATA_DIR_PATH = path.join(__dirname, "..", "data");

const createDataDirectory = (): void => {
  if (!fs.existsSync(DATA_DIR_PATH)) {
    console.log("Data directory does not exist. Creating data directory...");
    fs.mkdirSync(DATA_DIR_PATH);
    console.log("Data directory created successfully.");
  }
};

const fetchEndpoint = async (
  slug: string,
  query: Map<string, string> = new Map(),
  page: number = 0
): Promise<any> => {
  const DATAMALL_API_KEY = process.env.DATAMALL_API_KEY;
  if (!DATAMALL_API_KEY) {
    throw new Error(
      "DATAMALL_API_KEY is not defined as an environment variable."
    );
  }

  // Build base URL with the slug
  let url = `https://datamall2.mytransport.sg/ltaodataservice/${slug}?`;

  // Add query parameters from the Map
  for (const [key, value] of query.entries()) {
    url += `${key}=${encodeURIComponent(value)}&`;
  }

  // Add skip parameter for pagination (page * 500)
  url += `$skip=${page * 500}`;

  const response = await fetch(url, {
    headers: {
      AccountKey: DATAMALL_API_KEY,
      accept: "application/json",
    },
  });

  // Return the raw JSON response for the caller to process
  return response.json();
};

const fetchStops = async () => {
  var page = 0;
  var stops: any[] = [];

  while (true) {
    const response = await fetchEndpoint("BusStops", new Map(), page);
    stops = stops.concat(response.value);
    page++;
    if (response.value.length < 500) {
      break;
    }
  }

  return stops;
};

const fetchServices = async () => {
  var page = 0;
  var services: any[] = [];

  while (true) {
    const response = await fetchEndpoint("BusServices", new Map(), page);
    services = services.concat(response.value);
    page++;
    if (response.value.length < 500) {
      break;
    }
  }

  return services;
};

const saveDataToFile = (filename: string, data: any[]) => {
  const filePath = path.join(DATA_DIR_PATH, filename);

  try {
    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFileSync(filePath, jsonData, "utf8");
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
};

createDataDirectory();
fetchStops().then((stops) => {
  saveDataToFile("stops.json", stops);
});
fetchServices().then((services) => {
  saveDataToFile("services.json", services);
});
