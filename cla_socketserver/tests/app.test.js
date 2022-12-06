const ioClient = require('socket.io-client');
const request = require('supertest');
const { httpServer, socketServer } = require("../app");
const peopleManager = require('../utils/peopleManager');

describe("socket server app", () => {
    let nspSocket, testServer;
    const testPort = 5005;
    const testUserInfo = {
        'username': 'test_user',
        'usertype': 'operator',
        'appVersion': '1.0.0'
    };

    beforeAll((done) => {
        testServer = httpServer.listen(testPort);
        nspSocket = ioClient.connect(`http://localhost:${testPort}/socket.io`);
        nspSocket.once('connect', done);
    });

    afterAll(() => {
        nspSocket.close();
        socketServer.close();
        testServer.close();
    });

    test("should respond to liveness probe correctly", async () => {
        const response = await request(testServer).get("/socket.io/?eio=3&transport=polling");
        expect(response.statusCode).toBe(200);
    });

    test("should allow clients to send an identify message", (done) => {
        const expectedConnectionInfo = {
            caseViewed: null,
            appVersion: testUserInfo.appVersion,
            userType: testUserInfo.usertype
        }

        nspSocket.emit('identify', testUserInfo);

        setTimeout(() => {
            let user = peopleManager.people[testUserInfo.username];
            expect(user).toBeTruthy();
            let connections = Object.keys(user.connections);
            expect(connections.length).toBe(1);
            expect(user.connections[connections[0]]).toStrictEqual(expectedConnectionInfo);
            done();
        }, 1000);

    });
});