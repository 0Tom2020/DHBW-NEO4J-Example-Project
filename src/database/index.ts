const neo4j = require('neo4j-driver');


export function getSession() {
    const driver = neo4j.driver(
        'bolt://localhost:7687',
        neo4j.auth.basic('neo4j', 'password')
    );
    return driver.session();
}