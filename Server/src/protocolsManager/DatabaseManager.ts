import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import TokenManager from "../Services/TokenManagments";
import UserMangments from "../Services/UserManagments";
import DataBaseMangments from "../Services/DataBaseMangments";
const PROTO_PATH = "./src/protocols/Database.proto";
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const DbServ = grpc.loadPackageDefinition(packageDefinition) as unknown as {
  DbService: grpc.ServiceClientConstructor;
};
export default function Init(server: any) {
  server.addService(DbServ.DbService.service, {
    Createdb: async ({ request: { token, name } }: any, callback: any) => {
      console.log("sssx", token, name);
      if (await TokenManager.isAdmin(token)) {
        const x = await DataBaseMangments.CreateDb(name);
        if (x) {
          callback(null, {
            message: "db created successfully",
            code: 201,
          });
        } else {
          callback(null, {
            message: "db exist",
            code: 400,
          });
        }
      } else {
        callback(null, {
          message: `unauthorized`,
          code: 401,
        });
      }
    },
    Deletedb: async ({ request: { token, name } }: any, callback: any) => {
      if (await TokenManager.isAdmin(token)) {
        const x = await DataBaseMangments.DeleteDb(name);
        if (x) {
          callback(null, {
            message: "DataBase deleted successfully",
            code: 200,
          });
        } else {
          callback(null, {
            message: "ERROR",
            code: 500,
          });
        }
      } else {
        callback(null, {
          message: "unauthorized",
          code: 401,
        });
      }
    },
    Getdb: async ({ request: { token } }: any, callback: any) => {
      console.log(token);
      if (await TokenManager.verify(token)) {
        const x = await DataBaseMangments.getDbs();
        console.log(x);
        callback(null, { dblist: x, code: 200 });
      } else {
        callback(null, { dblist: [], code: 401 });
      }
    },
  });
}
