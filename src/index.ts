import * as express from 'express';
import * as logger from 'morgan';
import {registerController} from "./controller";

const app = express()
app.use(logger('dev'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

registerController(app);

const server = app.listen(8080, () => {
    console.log('App is running...');
});
