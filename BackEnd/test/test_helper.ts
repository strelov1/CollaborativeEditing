import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGODB_PRIMARY_HOST, MONGODB_PORT, MONGODB_TEST_DATABASE } =
  process.env;

const dbUrl = `mongodb://${MONGODB_PRIMARY_HOST}:${MONGODB_PORT}/${MONGODB_TEST_DATABASE}`;

mongoose.connect(dbUrl);
mongoose.connection
  .on("error", () => {
    console.log(`unable to connect to database: ${dbUrl}`);
  });

beforeEach((done) => {
  mongoose.connection.collections.nodes.drop(() => {
    done();
  });
});
