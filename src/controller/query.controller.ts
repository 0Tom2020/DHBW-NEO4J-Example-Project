import {Router} from "express";
import {getSession} from "../database";

export const queryController = Router();

//GET get all persons
queryController.get('/persons', (req, res, next) => {
    const session = getSession();
    session.run('MATCH (n:Person) RETURN n.name')
        .then((result) => {
            const persons = result.records.map(record => record.get('n.name'));
            res.status(200);
            res.send(persons);
            res.end();
        })
        .catch(error => {
            console.log(error);
            session.close();
            next(error);
        });
});

