import { faker } from "@faker-js/faker"

const db = {
    "users": [
        { "id": 1, "username": "test", "email": "test@email.com", "password": "pswd" },
        { "id": 2, "username": faker.internet.username(), "email": faker.internet.email(), "password": faker.internet.password() },
        { "id": 3, "username": faker.internet.username(), "email": faker.internet.email(), "password": faker.internet.password() },
        { "id": 4, "username": faker.internet.username(), "email": faker.internet.email(), "password": faker.internet.password() },
    ],
    "topics": [
        { "id": 1, "name": faker.lorem.word(), "description": faker.lorem.paragraph()},
        { "id": 2, "name": faker.lorem.word(), "description": faker.lorem.paragraph() },
        { "id": 3, "name": faker.lorem.word(), "description": faker.lorem.paragraph() },
        { "id": 4, "name": faker.lorem.word(), "description": faker.lorem.paragraph() }
    ],
    "posts": [
        { "id": 1, "title": faker.lorem.word(), "text": faker.lorem.paragraph(), "author": 1, "topic": 1, "date": faker.date.past() },
        { "id": 2, "title": faker.lorem.word(), "text": faker.lorem.paragraph(), "author": 2, "topic": 2, "date": faker.date.past() },
        { "id": 3, "title": faker.lorem.word(), "text": faker.lorem.paragraph(), "author": 3, "topic": 3, "date": faker.date.past() },
        { "id": 4, "title": faker.lorem.word(), "text": faker.lorem.paragraph(), "author": 4, "topic": 4, "date": faker.date.past() },
        { "id": 5, "title": faker.lorem.word(), "text": faker.lorem.paragraph(), "author": 4, "topic": 1, "date": faker.date.past() },
        { "id": 6, "title": faker.lorem.word(), "text": faker.lorem.paragraph(), "author": 2, "topic": 1, "date": faker.date.past() },
        { "id": 7, "title": faker.lorem.word(), "text": faker.lorem.paragraph(), "author": 3, "topic": 1, "date": faker.date.past() },
    ],
    "subscriptions": [
        { "u_id": 1, "t_id": 1 }
    ]
}

export default db;