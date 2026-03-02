import express from "express";

import config from "./config";
import auth from "./auth";
import service from "./service";

const app = express();

app.use(auth);
app.use(service);

app.listen(config.port, () => {
	console.log(`Server listening on port ${config.port}`);
});
