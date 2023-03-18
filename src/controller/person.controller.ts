import {Router} from "express";
import {getSession} from "../database";

export const personControllerRouter = Router();

const session = getSession();



//PUT create new Person
personControllerRouter.get('/', (req, res, next) => {
    session.run('MATCH (p:Person) RETURN p')
        .then((result) => {
            const people = result.records.map((record) => {
                return record.get('p').properties;
            });
            res.json(people);
        })
        .catch((error) => {
            next(error);
        })
        .finally(() => {
            session.close();
        });
    console.log(1)
});