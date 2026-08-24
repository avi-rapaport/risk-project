# risk-project

## files structure

```
├── Dockerfile
├── README.md
├── docker-compose.yaml
├── exam-backend.md
├── exam-links.md
├── package-lock.json
├── package.json
├── public
│   ├── app.js
│   ├── assets
│   │   ├── israel-lebanon-map-clean.png
│   │   └── israel-lebanon-map.png
│   ├── index.html
│   └── styles.css
└── src
    ├── db.js
    ├── middleware.js
    ├── repositories
    │   ├── game.repo.js
    │   └── map.repo.js
    ├── routes
    │   └── game.route.js
    ├── server.js
    ├── services
    │   ├── computer.service.js
    │   ├── game.service.js
    │   └── map.json
    └── utils
        └── utils.battle.js
```

## DB choice

I chose MongoDB because I think that its more flexible data structure allows for better work with arrays and nested objects, as in the current project, and also because there is no particular need for a live connection between two entities, so I don't need a relational database.

## running instructions

git clone https://github.com/avi-rapaport/risk-project.git

cd risk project

docker compose up --build
