import cookieParser from 'cookie-parser';
import express from 'express'
import authRoute from './module/auth/auth.route.js'

const app = express();
// const app = fastify() 

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/api/auth", authRoute)


export default app;