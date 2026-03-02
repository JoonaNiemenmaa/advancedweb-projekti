import dotenv from "dotenv";

dotenv.config();

interface IOptions {
	port: number;
	secret: string;
}

const config: IOptions = {
	port: 3000,
	secret: process.env.SECRET ? process.env.SECRET : "warrior cat",
};

export default config;
