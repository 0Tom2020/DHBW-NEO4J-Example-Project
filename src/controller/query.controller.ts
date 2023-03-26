import {Router} from "express";
import {getSession} from "../database";
import {checkIfPersonExists} from "./helper";

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

//GET all persons that personOne follows
queryController.get('/persons/:personOne/follows', (req, res, next) => {
    const session = getSession();
    const personOne = req.params['personOne'];
    session.run('MATCH (n:Person {name: $name})-[:follows]->(m:Person) RETURN m.name', {name: personOne})
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
});

//GET get shortest path between two persons
queryController.get('/persons/:personOne/shortestPath/:personTwo', async (req, res, next) => {
    const session = getSession();
    const personOne = req.params['personOne'];
    const personTwo = req.params['personTwo'];

    const personOneExists = await checkIfPersonExists(personOne);
    const personTwoExists = await checkIfPersonExists(personTwo);

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


    session.run('MATCH (p1:Person {name: $personOne}), (p2:Person {name: $personTwo}) MATCH path = shortestPath((p1)-[:follows*]->(p2)) RETURN path', {
        personOne: personOne,
        personTwo: personTwo
    })
        .then((result) => {
            const paths = result.records.map(record => record.get('path'));

            if (paths.length === 0) {
                res.status(400);
                res.send('No path found between ' + personOne + ' and ' + personTwo);
                res.end();
                return;
            }

            res.status(200);
            const pathStrings = paths.map(path => {
                const names = path.segments.map(segment => segment.start.properties.name)
                    .concat(path.end.properties.name);
                return names.join(' --> ');
            });

            res.send(pathStrings.join('\n'));
            res.end();
        })
        .catch(error => {
            console.log(error);
            session.close();
            next(error);
        });
});
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
queryController.get('/persons/:person/followers', (req, res, next) => {
    const session = getSession();
    const person = req.params['person'];

    if (!checkIfPersonExists(person)) {
        session.close();
        res.status(400);
        res.send('Person does not exist');
        res.end();
        return;
    }

    session.run('MATCH (n:Person {name: $name})<-[:follows]-(m:Person) RETURN m.name', {name: person})
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








/*// Create 20 people with random names
FOREACH (name IN ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Isabelle', 'Jack', 'Kate', 'Liam', 'Mia', 'Nathan', 'Olivia', 'Peter', 'Queenie', 'Rachel', 'Samuel', 'Tina'] |
CREATE (:Person {name: name}));

// Create random follow relationships
MATCH (p1:Person), (p2:Person)
WHERE p1 <> p2 AND rand() < 0.5
WITH p1, p2 LIMIT 50
CREATE (p1)-[:follows]->(p2);

// Create random follow-back relationships
MATCH (p1:Person)-[r:follows]->(p2:Person)
WHERE rand() < 0.5
WITH p1, p2, r
MERGE (p2)-[:follows]->(p1);*/

