import {getSession} from "../database";

export function checkIfPersonExists(person) {
    const session = getSession();
    return session.run('MATCH (p:Person {name: $person}) RETURN p', {person: person})
        .then((result) => {
            session.close();
            return result.records.length > 0;
        })
        .catch(error => {
            console.log(error);
            session.close();
            return false;
        })
}