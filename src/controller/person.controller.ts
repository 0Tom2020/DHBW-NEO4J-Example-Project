import {Router} from "express";
import {getSession} from "../database";
import {checkIfPersonExists} from "./helper";

export const personControllerRouter = Router();

//PUT create new Person
personControllerRouter.post('/new', (req, res, next) => {
    const session = getSession();
    if (req.body['name'] === undefined || req.body['username'] === undefined) {
        res.status(400).send('Bad Request');
        return;
    }
    const name = req.body['name'];
    const username = req.body['username'];

    session.run('match (n:Person) WHERE n.username = $username return count(n)', {username: username})
        .then((result) => {
            const count = result.records[0].get('count(n)').toNumber();
            if (count > 0) {
                // Person exists
                res.status(400);
                res.send('Person already exists');
                res.end();
            } else {
                // Person does not exist
                session.run('CREATE (:Person {name: $name, username: $username})', {name: name, username: username})
                    .then(() => {
                        session.close();
                        res.status(200);
                        res.send('Person created');
                        res.end();
                    })
                    .catch(error => {
                        console.log(error);
                        session.close();
                        next(error);
                    });
            }
        })
});

//PUT create connection between two persons
personControllerRouter.post('/connection', async (req, res, next) => {
    if (req.body['personOne'] === undefined || req.body['followsPersonTwo'] === undefined) {
        res.status(400).send('Bad Request');
        return;
    }
    const session = getSession();
    const personOne = req.body['personOne'];
    const followsPersonTwo = req.body['followsPersonTwo'];

    const personOneExists = await checkIfPersonExists(personOne);
    const followsPersonTwoExists = await checkIfPersonExists(followsPersonTwo);

    if (!personOneExists) {
        session.close();
        res.status(400);
        res.send('PersonOne does not exist');
        res.end();
        return;
    }

    if (!followsPersonTwoExists) {
        session.close();
        res.status(400);
        res.send('followsPersonTwo does not exist');
        res.end();
        return;
    }


     session.run('MATCH (p1:Person)-[r:follows]->(p2:Person) WHERE p1.username = $personOne AND p2.username = $followsPersonTwo RETURN count(r) AS count', {
         personOne: personOne,
         followsPersonTwo: followsPersonTwo
     })
         .then((result) => {
             const count = result.records[0].get('count').toNumber();
             if (count > 0) {
                 // Relationship exists
                 session.close();
                 res.status(400);
                 res.send('Person already follows the person');
                 res.end();
             } else {
                 // Relationship does not exist
                 session.run('MATCH (p1:Person {username: $personOne}), (p2:Person {username: $followsPersonTwo}) CREATE (p1)-[:follows]->(p2)', {
                     personOne: personOne,
                     followsPersonTwo: followsPersonTwo
                 })
                     .then(() => {
                         session.close();
                         res.status(200);
                         res.send('Person follows the person');
                         res.end();
                     })
                     .catch(error => {
                         console.log(error);
                         session.close();
                         next(error);
                     });
             }
         })
         .catch((error) => {
             console.log(error);
             session.close();
             next(error);
         });
})

//DELETE delete connection between two persons
personControllerRouter.delete('/connection', async (req, res, next) => {
    if (req.body['personOne'] === undefined || req.body['unfollowsPersonTwo'] === undefined) {
        res.status(400).send('');
        return;
    }

    const session = getSession();
    const personOne = req.body['personOne'];
    const unfollowsPersonTwo = req.body['unfollowsPersonTwo'];

    const personOneExists = await checkIfPersonExists(personOne);
    const unfollowsPersonTwoExists = await checkIfPersonExists(unfollowsPersonTwo);

    if (!personOneExists) {
        session.close();
        res.status(400);
        res.send('PersonOne does not exist');
        res.end();
        return;
    }

    if (!unfollowsPersonTwoExists) {
        session.close();
        res.status(400);
        res.send('unfollowsPersonTwo does not exist');
        res.end();
        return;
    }


    session.run('MATCH (p1:Person)-[r:follows]->(p2:Person) WHERE p1.username = $personOne AND p2.username = $followsPersonTwo RETURN count(r) AS count', {
        personOne: personOne,
        followsPersonTwo: unfollowsPersonTwo
    })
        .then((result) => {
            const count = result.records[0].get('count').toNumber();
            if (count > 0) {
                // Relationship exists
                session.run('MATCH (p1:Person {username: $personOne})-[r:follows]->(p2:Person {username: $followsPersonTwo}) DELETE r', {
                    personOne: personOne,
                    followsPersonTwo: unfollowsPersonTwo
                })
                    .then(() => {
                        session.close();
                        res.status(200);
                        res.send('Person does not follow the person anymore');
                        res.end();
                    })
                    .catch(error => {
                        console.log(error);
                        session.close();
                        next(error);
                    });
            } else {
                // Relationship does not exist
                res.status(400);
                res.send('Person does not follow the person');
                res.end();
            }
        })
        .catch((error) => {
            console.log(error);
            session.close();
            next(error);
        });
})

//DELETE delete Person
personControllerRouter.delete('/delete', async (req, res, next) => {
    const session = getSession();
    if (req.body['username'] === undefined) {
        res.status(400).send('Bad Request');
        return;
    }

    const username = req.body['username'];

    const personExists = await checkIfPersonExists(username);
    if (!personExists) {
        session.close();
        res.status(400);
        res.send('Person does not exist');
        res.end();
        return;
    }


    session.run('match (n:Person) WHERE n.username = $name return count(n)', {name: username})
        .then((result) => {
            const count = result.records[0].get('count(n)').toNumber();
            if (count > 0) {
                // Person exists
                session.run('MATCH (p:Person {username: $name}) DETACH DELETE p', {name: username})
                    .then(() => {
                        session.close();
                        res.status(200);
                        res.send('Person deleted');
                        res.end();
                    })
                    .catch(error => {
                        console.log(error);
                        session.close();
                        next(error);
                    });
            } else {
                // Person does not exist
                res.status(400);
                res.send('Person does not exist');
                res.end();
            }
        })
})