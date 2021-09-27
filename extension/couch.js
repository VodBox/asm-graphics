"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const nodecgApiContext = tslib_1.__importStar(require("./nodecg-api-context"));
const nodecg = nodecgApiContext.get();
const couchNamesRep = nodecg.Replicant('couch-names');
const noCamRep = nodecg.Replicant('no-cam');
nodecg.listenFor('update-hostnames', (names) => {
    couchNamesRep.value.current = names;
});
// Unused due to ux anti pattern
nodecg.listenFor('rename-hostnames', (data) => {
    const hostNamesMutable = couchNamesRep.value;
    hostNamesMutable.current[data.index] = data.person;
    couchNamesRep.value = hostNamesMutable;
});
nodecg.listenFor('remove-hostname', (index) => {
    const hostNamesMutable = couchNamesRep.value;
    hostNamesMutable.current.splice(index, 1);
    couchNamesRep.value = hostNamesMutable;
});
// Preview host names
nodecg.listenFor('update-preview-hostnames', (names) => {
    couchNamesRep.value.preview = names;
});
nodecg.listenFor('remove-preview-hostname', (index) => {
    const hostNamesMutable = couchNamesRep.value;
    hostNamesMutable.preview.splice(index, 1);
    couchNamesRep.value = hostNamesMutable;
});
nodecg.listenFor('no-cam-preview', (value) => {
    noCamRep.value.preview = value;
});
nodecg.listenFor('no-cam-current', (value) => {
    noCamRep.value.current = value;
});
nodecg.listenFor('set-discord-user-preview', (person) => {
    const index = couchNamesRep.value.preview.findIndex(couch => couch.name === person.name);
    if (index === -1)
        return;
    couchNamesRep.value.preview[index] = person;
});
nodecg.listenFor('set-discord-user-live', (person) => {
    const index = couchNamesRep.value.current.findIndex(couch => couch.name === person.name);
    if (index === -1)
        return;
    couchNamesRep.value.current[index] = person;
});
