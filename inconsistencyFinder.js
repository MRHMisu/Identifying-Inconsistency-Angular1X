#!/usr/bin/env node
var  inconsistencyFinder=require('./Fantasia/InconsistencyIdentifier/InconsistencyIdentification.js');
var directoryFinder=require('./Fantasia/InconsistencyIdentifier/FindDirectory.js');

var path=directoryFinder.getCurrentDirectoryBase();
inconsistencyFinder.getInconsistency(path);