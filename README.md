docker exec -it node-7-studentmanager-mongodb-1 mongosh -u admin -p secret
#### Run this command at the first time in prisma container: 
- For development: docker compose exec student-service npx prisma migrate dev --name init
- For production: docker compose exec student-service npx prisma migrate deploy