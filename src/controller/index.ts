import {personControllerRouter} from "./person.controller";
import {queryController} from "./query.controller";


export function registerController(app: any) {
    app.use('/person', personControllerRouter);
    app.use('/query', queryController);
}