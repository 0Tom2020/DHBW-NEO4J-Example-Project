import {Router} from "express";
import {getSession} from "../database";
import {checkIfPersonExists} from "./helper";

export const debugControllerRouter = Router();

const users = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Isabelle', 'Jack', 'Kate',
    'Liam', 'Mia', 'Nathan', 'Olivia', 'Peter', 'Queenie', 'Rachel', 'Samuel', 'Tina']

//DELETE delete all nodes and relationships
debugControllerRouter.post('/clearDatabase', (req, res, next) => {
    const session = getSession();
    session.run('MATCH (n) DETACH DELETE n')
        .then(() => {
            res.status(200);
            res.end();
        })
        .catch(error => {
            console.log(error);
            session.close();
            next(error);
        });
});

// POST create default data
debugControllerRouter.post('/createDefaultData', async (req, res, next) => {
    const session = getSession();
    let list = "'" + users.join("','") + "'";
    await session.run('FOREACH (name IN [' + list + '] | CREATE (:Person {name: name, username: toLower(REPLACE(name,\' \',\'\'))}));');
    await session.run('MATCH (p1:Person), (p2:Person) WHERE p1 <> p2 AND rand() < 0.5 WITH p1, p2 LIMIT 50 CREATE (p1)-[:follows]->(p2);');
    await session.run('MATCH (p1:Person)-[r:follows]->(p2:Person) WHERE rand() < 0.5 WITH p1, p2, r MERGE (p2)-[:follows]->(p1);');
    res.end();
});