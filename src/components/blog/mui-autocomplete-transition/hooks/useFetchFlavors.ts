import type Dessert from "../Dessert";
import type FlavorOption from "../FlavorOption";
import FlavorOptions from "../constants/FlavorOptions";

const cache = new Map();

async function getFlavors(dessert: Dessert) {
  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

  return FlavorOptions[dessert];
}

async function getData(dessert: Dessert) {
  return await getFlavors(dessert);
}

export function fetchData(dessert: Dessert) {
  if (!cache.has(dessert)) {
    cache.set(dessert, getData(dessert));
  }
  return cache.get(dessert);
}

export function use(promise: {
  status: string;
  reason: string;
  value: FlavorOption[];
}) {
  if (promise.status === "fulfilled") {
    return promise.value;
  }
  if (promise.status === "rejected") {
    throw promise.reason;
  }
  if (promise.status === "pending") {
    throw promise;
  }
  promise.status = "pending";
  // @ts-ignore
  promise.then(
    (result: FlavorOption[]) => {
      promise.status = "fulfilled";
      promise.value = result;
    },
    (reason: string) => {
      promise.status = "rejected";
      promise.reason = reason;
    },
  );
  throw promise;
}

// export default function useFetchFlavors(dessert: Dessert) {
//   const flavors = use(fetchData(dessert));
//   return flavors;
// }
