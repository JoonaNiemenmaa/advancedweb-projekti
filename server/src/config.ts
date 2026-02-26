import dotenv from "dotenv";

dotenv.config();

type TOptions = {
	port: number;
	secret: string;
};

const config: TOptions = {
	port: 3000,
	secret: process.env.SECRET ? process.env.SECRET : "warrior cat",
};

export default config;
