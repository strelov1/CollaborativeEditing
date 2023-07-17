
```bash
docker run -d -p 27017:27017 --name mongodb mongo:4.4 --replSet rs0
```

```bash
docker exec -it mongodb bash -c 'mongo --eval "rs.initiate({_id: \"rs0\", members: [{_id: 0, host: \"127.0.0.1:27017\"}]})"'
```
