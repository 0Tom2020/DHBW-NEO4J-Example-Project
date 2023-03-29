import {Router} from "express";
import {getSession} from "../database";
import {checkIfPersonExists} from "./helper";

export const queryController = Router();

//GET get all persons
queryController.get('/persons', (req, res, next) => {
    const session = getSession();
    session.run('MATCH (n:Person) RETURN n.username, n.name')
        .then((result) => {
            const persons = result.records.map(record => {
                return {
                    username: record.get('n.username'),
                    name: record.get('n.name'),
                }
            });
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

//GET all persons that personOne follows
queryController.get('/persons/:username/follows', (req, res, next) => {
    const session = getSession();
    const username = req.params['username'];
    session.run('MATCH (n:Person {username: $name})-[:follows]->(m:Person) RETURN m.name, m.username', {name: username})
        .then((result) => {
            const persons = result.records.map(record => {
                return {
                    username: record.get('m.username'),
                    name: record.get('m.name'),
                }
            });
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

//GET get shortest path between two persons
queryController.get('/persons/:usernameOne/shortestPath/:usernameTwo', async (req, res, next) => {
    const session = getSession();
    const usernameOne = req.params['usernameOne'];
    const usernameTwo = req.params['usernameTwo'];

    const personOneExists = await checkIfPersonExists(usernameOne);
    const personTwoExists = await checkIfPersonExists(usernameTwo);

    if (!personOneExists) {
        session.close();
        res.status(400);
        res.send('PersonOne does not exist');
        res.end();
        return;
    }
    if (!personTwoExists) {
        session.close();
        res.status(400);
        res.send('PersonTwo does not exist');
        res.end();
        return;
    }


    session.run('MATCH (p1:Person {username: $usernameOne}), (p2:Person {username: $usernameTwo}) MATCH path = shortestPath((p1)-[:follows*]->(p2)) RETURN path', {
        usernameOne: usernameOne,
        usernameTwo: usernameTwo
    })
        .then((result) => {
            const paths = result.records.map(record => record.get('path'));

            if (paths.length === 0) {
                res.status(400);
                res.send('No path found between ' + usernameOne + ' and ' + usernameTwo);
                res.end();
                return;
            }

            res.status(200);
            const pathStrings = paths.map(path => {
                const names = path.segments.map(segment => segment.start.properties.username)
                    .concat(path.end.properties.username);
                return names.join(' --> ');
            });

            res.send(pathStrings);
            res.end();
        })
        .catch(error => {
            console.log(error);
            session.close();
            next(error);
        });
});

// GET all persons who personOne is follower and who personTwo followed
queryController.get('/persons/:usernameOne/:usernameTwo/followed', async (req, res, next) => {
    const session = getSession();
    const usernameOne = req.params['usernameOne'];
    const usernameTwo = req.params['usernameTwo'];

    const personOneExists = await checkIfPersonExists(usernameOne);
    const personTwoExists = await checkIfPersonExists(usernameTwo);

    if (!personOneExists) {
        session.close();
        res.status(400);
        res.send('PersonOne does not exist');
        res.end();
        return;
    }
    if (!personTwoExists) {
        session.close();
        res.status(400);
        res.send('PersonTwo does not exist');
        res.end();
        return;
    }

    session.run('MATCH (p:Person {username: $usernameTwo})-[:follows]->(followed:Person) MATCH (followed)<-[:follows]-(you:Person {username: $usernameOne}) RETURN followed.name, followed.username', {
        usernameOne: usernameOne,
        usernameTwo: usernameTwo
    }).then((result) => {
        const follower = result.records.map(record => record.get('followed.username'));
        res.status(200);
        res.send(follower);
        res.end();
    })
        .catch(error => {
            console.log(error);
            session.close();
            next(error);
        });
})


/*
//GET get all persons that the person follows (and the person --> depth x times)
queryController.get('/persons/:person/follows/:depth', (req, res, next) => {
    const session = getSession()
    const person = req.params['person'];
    const depth = req.params['depth'];
    const depthNumber = Number(depth)

    if (!checkIfPersonExists(person)) {
        session.close();
        res.status(400);
        res.send('Person does not exist');
        res.end();
        return;
    }

    session.run('MATCH (p:Person {name: $person}) MATCH path = (p)-[:follows]->()-[:follows]->(f:Person) WHERE length(path) = $depth AND NOT (p)-[:follows]->(f) RETURN DISTINCT f.name', {
        person: person,
        depth: depth
    })
        .then((result) => {
            const persons = result.records.map(record => record.get('f.name'));
            res.status(200);
            res.send(persons);
            res.end();
        })
        .catch(error => {
            console.log(error);
            session.close();
            next(error);
        });
});*/


//GET all persons that follow a person
queryController.get('/persons/:username/followers', (req, res, next) => {
    const session = getSession();
    const username = req.params['username'];

    if (!checkIfPersonExists(username)) {
        session.close();
        res.status(400);
        res.send('Person does not exist');
        res.end();
        return;
    }

    session.run('MATCH (n:Person {username: $username})<-[:follows]-(m:Person) RETURN m.name', {username: username})
        .then((result) => {
            const persons = result.records.map(record => record.get('m.name'));
            res.status(200);
            res.send(persons);
            res.end();
        })
        .catch(error => {
            console.log(error);
            session.close();
            next(error);
        });
})