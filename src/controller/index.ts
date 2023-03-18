import {personControllerRouter} from "./person.controller";


export function registerController(app: any) {
    app.use('/person', personControllerRouter);
}