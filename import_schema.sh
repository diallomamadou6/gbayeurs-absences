#!/bin/bash
# Script pour importer le schéma dans PlanetScale
# Usage : ./import_schema.sh <planetscale-host> <user> <password> <database>

if [ $# -ne 4 ]; then
    echo "Usage: $0 <host> <user> <password> <database>"
    exit 1
fi

HOST=$1
USER=$2
PASSWORD=$3
DATABASE=$4

mysql --ssl-mode=REQUIRED --host=$HOST --user=$USER --password=$PASSWORD $DATABASE < schema_mysql.sql

echo "Schéma importé avec succès dans PlanetScale."