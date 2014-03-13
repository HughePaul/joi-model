// Load Modules
var Lab = require('lab');
var Joi = require('joi');
var joiModel = require('../lib');
var JoiArray = require('../lib/joiarray');

// Test shortcuts
var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;

describe('JoiArray', function() {

    it('loads an array based on an array schema', function(done) {

        var schema = Joi.array().includes(Joi.string());

        var arr = ['test1', 'test2'];

        var jarray = new JoiArray(schema, null, arr);

        expect(jarray.length).to.equal(2);
        expect(jarray[0]).to.equal('test1');
        expect(jarray[1]).to.equal('test2');

        done();
    });

    it('allows adding items with push and unshift', function(done) {

        var schema = Joi.array().includes(Joi.string());

        var arr = ['test1'];

        var jarray = new JoiArray(schema, null, arr);

        jarray.push('post');
        jarray.unshift('pre');

        expect(jarray.length).to.equal(3);
        expect(jarray[0]).to.equal('pre');
        expect(jarray[2]).to.equal('post');

        done();
    });

    it('allows removing items with pop and shift', function(done) {

        var schema = Joi.array().includes(Joi.string());

        var arr = ['test1', 'test2', 'test3'];

        var jarray = new JoiArray(schema, null, arr);

        var popped = jarray.pop();
        var shifted = jarray.shift();

        expect(jarray.length).to.equal(1);
        expect(shifted).to.equal('test1');
        expect(jarray.get(0)).to.equal('test2');
        expect(popped).to.equal('test3');

        done();
    });

    it('allows splicing an array', function(done) {

        var schema = Joi.array().includes(Joi.string());

        var arr = ['test1', 'test2', 'test3'];

        var jarray = new JoiArray(schema, null, arr);

        var spliced = jarray.splice(1,1,'new','second');

        expect(jarray.length).to.equal(4);
        expect(spliced).to.deep.equal(['test2']);
        expect(jarray.get(1)).to.equal('new');
        expect(jarray.get(2)).to.equal('second');

        var err;
        try {
            jarray.splice(1,2,99);
        }catch(e) {
            err = e;
        }
        expect(err).to.exist;
        expect(err.message).to.contain('array value in position 0 fails because the value of');
        expect(err.message).to.contain('must be a string');

        done();
    });

    it('loads an array based on an array schema', function(done) {

        var schema = Joi.array().includes(Joi.string());

        var arr = ['test1', 'test2'];

        var jarray = new JoiArray(schema, null, arr);

        expect(jarray.length).to.equal(2);
        expect(jarray[0]).to.equal('test1');
        expect(jarray[1]).to.equal('test2');

        done();
    });

    it('loads an array based on an array schema including an object', function(done) {

        var schema = Joi.array().includes(Joi.object({
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c'),
            c: Joi.string().email().optional()
        }));

        var arr = [{
            a: 1,
            b: 'b',
            c: 'test@email.com'
        }, {
            a: 2,
            b: 'c',
            c: 'blah@test.com'
        }];

        var jarray = new JoiArray(schema, null, arr);

        expect(jarray.length).to.equal(2);
        expect(jarray[0].b).to.equal('b');
        expect(jarray.get(1).c).to.equal('blah@test.com');

        done();
    });

    it('does not support mixing array types', function(done) {

        var schema = Joi.array().includes(Joi.string(), Joi.object());

        var arr = ['test1', 'test2'];

        var err;
        try {
            var jarray = new JoiArray(schema, null, arr);
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;
        expect(err.message).to.contain('does not support mixing object models with other types');

        done();
    });

    it('does not support more than one object type', function(done) {

        var schema = Joi.array().includes(Joi.object(), Joi.object());

        var arr = ['test1', 'test2'];

        var err;
        try {
            var jarray = new JoiArray(schema, null, arr);
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;
        expect(err.message).to.contain('only supports one object model type per array');

        done();
    });

    it('will throw an error if the loaded value doesnt match the schema', function(done) {

        var schema = Joi.array().includes(Joi.string());

        var arr = ['test1', 1];

        var err;
        try {
            var jarray = new JoiArray(schema, null, arr);
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;
        expect(err.message).to.contain('array value in position 1 fails because the value of 1 must be a string');

        done();
    });

    it('will throw an error if the loaded object doesnt match the schema', function(done) {

        var schema = Joi.array().includes(Joi.object({
            a: Joi.string().required(),
            b: Joi.number().required()
        }));

        var arr = [{
            a: 'b',
            b: 3
        }, {
            a: 'd'
        }];

        var err;
        try {
            var jarray = new JoiArray(schema, null, arr);
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;
        expect(err.message).to.contain('is not allowed to be undefined');

        done();
    });

    it('will throw an error if the set object doesnt match the schema', function(done) {

        var schema = Joi.array().includes(Joi.object({
            a: Joi.string().required(),
            b: Joi.number().required()
        }));

        var jarray = new JoiArray(schema, null);

        jarray.set(4, {
            a: 'b',
            b: 3
        });

        var err;
        try {
            jarray.set(4, {
                a: 'b',
                b: 'test'
            });
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;
        expect(err.message).to.contain('must be a number');

        done();
    });

    it('will generate nice clean JSON output', function(done) {

        var schema = Joi.array().includes(Joi.object({
            a: Joi.string().required(),
            b: Joi.number().required()
        }));

        var jarray = new JoiArray(schema, null);
        jarray.set(4, {
            a: 'b',
            b: 3
        });

        var result = jarray.toString();

        expect(result).to.equal('[null,null,null,null,{"a":"b","b":3}]');

        done();
    });


});