docker exec -it node-7-studentmanager-user-db-1 mongosh -u admin -p secret
#### Run this command at the first time in prisma container: 
- For development: docker compose exec <container-name> npx prisma migrate dev --name init
- For production: docker compose exec <container-name> npx prisma migrate deploy