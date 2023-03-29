import {personControllerRouter} from "./person.controller";
import {queryController} from "./query.controller";
import {debugControllerRouter} from "./debug.controller";


export function registerController(app: any) {
    app.use('/person', personControllerRouter);
    app.use('/query', queryController);
    app.use('/debug', debugControllerRouter);
}