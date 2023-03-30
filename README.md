# DHBW-NEO4J-Example-Project

Set-up the Neo4j-Database with docker

1. create neo4j docker cpmpose:
commands:
    - docker pull neo4j
    - docker run --name myneo4j -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/password -d -v /absolute/path/to/your/home/directory/neo4j/data:/data neo4j

2. npm install
3. npm start
            
    