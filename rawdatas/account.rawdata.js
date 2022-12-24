// fix cứng _id phục vụ mục đích truy vấn các thứ liên quan đến count dễ dàng
const accounts = [
    {
        "_id": "63a6854c92f5e81f48ae4e51",
        "name": "Thomasin Janauschek",
        "password": "fccdmIaGc7K8",
        "phoneNumber": "0490904992",
        "avatar": {
            "filename": "",
            "url": "https://robohash.org/nesciuntquiavoluptatem.png?size=50x50&set=set1",
            "publicId": ""
        },
        "coverImage": {
            "filename": "",
            "url": "https://robohash.org/nesciuntnihilvoluptas.png?size=50x50&set=set1",
            "publicId": ""
        },
        "gender": "Female",
        "online": false,
        "token": "6ecabe2acf422c846428d63633e3078390574425",
        "isBlocked": false,
        "uuid": "0fa7e0aa-02b7-4bf2-a6b0-c5869387ce7f",
        "active": false,
        "description": "Nullam molestie nibh in lectus. Pellentesque at Nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
        "link": "http://rakuten.co.jp/sit/amet/lobortis/sapien/sapien/non.png",
        "city": "Mainz",
        "country": "Germany",
        "coordinates": {
            "latitude": 50.0022253,
            "longtitude": 51.0022253
        },
        "blockedAccounts": ["63a6854c92f5e81f48ae4e53"],
        "friends": [],
        "friendRequestReceived": [],
        "friendRequestSent": []
    },
    {
        "_id": "63a6854c92f5e81f48ae4e52",
        "name": "Valeria Kippax",
        "password": "gtXIytpmJQ0D",
        "phoneNumber": "0185937905",
        "avatar": {
            "filename": "",
            "url": "https://robohash.org/quocorporisquia.png?size=50x50&set=set1",
            "publicId": ""
        },
        "coverImage": {
            "filename": "",
            "url": "https://robohash.org/maximevoluptatesvoluptatem.png?size=50x50&set=set1",
            "publicId": ""
        },
        "gender": "Female",
        "online": true,
        "token": "dd5d368131a88bcf30aea5ecb20a760bf90c315f",
        "isBlocked": false,
        "uuid": "fa91a827-9ee9-452e-ae03-fdf8f9985701",
        "active": true,
        "description": "Nulla tempus. Vivamus in felis eu sapien cursus vestibulum. Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.",
        "link": "https://smugmug.com/amet/consectetuer/adipiscing/elit/proin/interdum/mauris.jsp",
        "city": "Wysokie Mazowieckie",
        "country": "Poland",
        "coordinates": {
            "latitude": 52.9148,
            "longtitude": 53.9148
        },
        "blockedAccounts": [],
        "friends": [],
        "friendRequestReceived": [],
        "friendRequestSent": []
    },
    {
        "_id": "63a6854c92f5e81f48ae4e53",
        "name": "Cassi Siene",
        "password": "uSbCoRMsR",
        "phoneNumber": "0422315213",
        "avatar": {
            "filename": "",
            "url": "https://robohash.org/liberoipsanihil.png?size=50x50&set=set1",
            "publicId": ""
        },
        "coverImage": {
            "filename": "",
            "url": "https://robohash.org/aliquamnonconsectetur.png?size=50x50&set=set1",
            "publicId": ""
        },
        "gender": "Female",
        "online": false,
        "token": "c42af63f66d4312359fd2e1c4ece4939b2ae641e",
        "isBlocked": true,
        "uuid": "0402b06f-8d3d-4da9-9561-41842deb5c08",
        "active": true,
        "description": "Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum.",
        "link": "https://msu.edu/integer/tincidunt/ante.html",
        "city": "Ignacio Zaragoza",
        "country": "Mexico",
        "coordinates": {
            "latitude": 19.1780491,
            "longtitude": 20.1780491
        },
        "blockedAccounts": [],
        "friends": [],
        "friendRequestReceived": [],
        "friendRequestSent": []
    },
    {
        "_id": "63a6854c92f5e81f48ae4e54",
        "name": "Ashton Spacie",
        "password": "xHKssk4o0",
        "phoneNumber": "0725626146",
        "avatar": {
            "filename": "",
            "url": "https://robohash.org/nisisitdicta.png?size=50x50&set=set1",
            "publicId": ""
        },
        "coverImage": {
            "filename": "",
            "url": "https://robohash.org/sedpraesentiumbeatae.png?size=50x50&set=set1",
            "publicId": ""
        },
        "gender": "Male",
        "online": true,
        "token": "3b1a5fa82ebd6043a1f19a89076500d2be73460f",
        "isBlocked": false,
        "uuid": "1fe356f8-a3df-45cc-8cf5-4490bb98e6ca",
        "active": true,
        "description": "Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, Nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.",
        "link": "http://phoca.cz/et.png",
        "city": "Kuressaare",
        "country": "Estonia",
        "coordinates": {
            "latitude": 58.2529231,
            "longtitude": 59.2529231
        },
        "blockedAccounts": [],
        "friends": [],
        "friendRequestReceived": [],
        "friendRequestSent": []
    },
    {
        "_id": "63a6854c92f5e81f48ae4e55",
        "name": "Elberta Bice",
        "password": "DhZX1P9FV8FR",
        "phoneNumber": "0204941457",
        "avatar": {
            "filename": "",
            "url": "https://robohash.org/eligendiseddoloribus.png?size=50x50&set=set1",
            "publicId": ""
        },
        "coverImage": {
            "filename": "",
            "url": "https://robohash.org/utdoloribusvoluptatem.png?size=50x50&set=set1",
            "publicId": ""
        },
        "gender": "Female",
        "online": true,
        "token": "339525937012116a1d327dcf5df7bf70d4e982eb",
        "isBlocked": true,
        "uuid": "32fb27a2-7f9d-491e-8d62-e0b84aba48f3",
        "active": true,
        "description": "Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.",
        "link": "http://twitter.com/turpis/a/pede/posuere.html",
        "city": "Balfour",
        "country": "South Africa",
        "coordinates": {
            "latitude": -26.6536509,
            "longtitude": -25.6536509
        },
        "blockedAccounts": [],
        "friends": [],
        "friendRequestReceived": [],
        "friendRequestSent": []
    }
]

module.exports = accounts;