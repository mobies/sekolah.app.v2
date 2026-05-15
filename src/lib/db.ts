import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as globalSchema from "../db/schema/global";
import * as tenantSchema from "../db/schema/tenant";

export type Env = {
  GLOBAL_DB_URL: string;
  GLOBAL_DB_TOKEN: string;
  [key: string]: any;
};

export const getGlobalDb = (env: Env) => {
  if (!env.GLOBAL_DB_URL) {
    throw new Error("GLOBAL_DB_URL is not defined");
  }
  const client = createClient({
    url: env.GLOBAL_DB_URL,
    authToken: env.GLOBAL_DB_TOKEN,
  });
  return drizzle(client, { schema: globalSchema });
};

export const getTenantDb = async (subdomain: string, env: Env) => {
  const globalDb = getGlobalDb(env);
  const school = await globalDb.query.schools.findFirst({
    where: (schools, { eq }) => eq(schools.subdomain, subdomain),
  });

  if (!school) {
    throw new Error(`School with subdomain "${subdomain}" not found`);
  }

  const client = createClient({
    url: school.dbUrl,
    authToken: school.dbToken || undefined,
  });
  return drizzle(client, { schema: tenantSchema });
};
