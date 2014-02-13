// Load Modules
var Lab = require('lab');
var Joi = require('joi');
var joiModel = require('../lib');

// Test shortcuts
var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;

describe('joiModel', function() {

    it('creates a model class from a schema', function(done) {

        var schema = {
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c', '6'),
            c: Joi.string().email().optional()
        };

        var SchemaModel = joiModel(schema);

        expect(SchemaModel).to.not.equal(null);

        done();
    });

    it('creates a model from a model class', function(done) {

        var schema = {
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c'),
            c: Joi.string().email().optional()
        };

        var SchemaModel = joiModel(schema);

        var obj = {
            a: 1,
            b: 'a',
            c: 'joe@example.com'
        };

        var m = new SchemaModel(obj);

        expect(m.a).to.equal(obj.a);
        expect(m.b).to.equal(obj.b);
        expect(m.c).to.equal(obj.c);

        done();
    });

    it('sets value of a model', function(done) {

        var schema = {
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c'),
            c: Joi.string().email().optional()
        };

        var SchemaModel = joiModel(schema);

        var obj = {
            a: 1,
            b: 'a',
            c: 'joe@example.com'
        };

        var m = new SchemaModel(obj);

        m.b = 'c';

        expect(m.b).to.equal('c');

        done();
    });

    it('sets updates only the specified data when asked to update', function(done) {

        var schema = {
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c'),
            c: Joi.string().email().optional()
        };

        var SchemaModel = joiModel(schema);

        var obj = {
            a: 1,
            b: 'a',
            c: 'joe@example.com'
        };

        var m = new SchemaModel(obj);

        m.updateData({
            b: 'c',
            a: 3
        });

        expect(m.a).to.equal(3);
        expect(m.b).to.equal('c');
        expect(m.c).to.equal('joe@example.com');

        done();
    });

    it('converts values to the correct type', function(done) {

        var schema = {
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c'),
            c: Joi.string().email().optional()
        };

        var SchemaModel = joiModel(schema, {
            modify: true
        });

        var obj = {
            a: 1,
            b: 'a',
            c: 'joe@example.com'
        };

        var m = new SchemaModel(obj, {
            convert: true
        });

        m.a = '3';

        expect(m.a).to.equal(3);

        done();
    });

    it('throws an error when the wrong type is set', function(done) {

        var schema = {
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c', '6'),
            c: Joi.string().email().optional()
        };

        var SchemaModel = joiModel(schema);

        var obj = {
            a: 1,
            b: 'a',
            c: 'joe@example.com'
        };

        var m = new SchemaModel(obj);

        var err;
        try {
            m.a = '5';
            m.b = 8;
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;

        done();
    });

    it('throws an error when a model is created with data of the wrong type', function(done) {

        var schema = {
            a: Joi.number().min(0).max(3).without('none'),
            b: Joi.string().valid('a', 'b', 'c', '6'),
            c: Joi.string().email().optional()
        };

        var SchemaModel = joiModel(schema);

        var obj = {
            a: 1,
            b: 'a',
            c: 'joe@example.com'
        };

        var m = new SchemaModel(obj);

        var err;
        try {
            m.a = '5';
            m.b = 8;
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;

        done();
    });

    it('throws an error if a recursive value is set to the wrong type', function(done) {

        var schema = {
            a: Joi.string().valid('a', 'b', 'c'),
            b: Joi.object({
                b1: Joi.string().required(),
                b2: Joi.string().email().required()
            }),
            c: Joi.array().includes(Joi.string()).required().min(1)
        };

        var SchemaModel = joiModel(schema);

        var obj = {
            a: 'a',
            b: {
                b1: 'hello',
                b2: 'world@test.com'
            },
            c: ['string']
        };

        var m = new SchemaModel(obj);

        m.b = {
            b1: 'firstSubItem',
            b2: 'valid@email.com'
        };

        m.b.b2 = 'test@blah.com';

        var err;
        try {
            m.b.b2 = 'world';
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;

        expect(m.b.b2).to.equal('test@blah.com');

        done();
    });


    it('produces clean json from a polluted object', function(done) {

        var schema = {
            a: Joi.string(),
            b: Joi.string(),
            c: Joi.string().required()
        };

        var SchemaModel = joiModel(schema);

        var obj = {
            a: 'aa',
            c: 'cc'
        };

        var m = new SchemaModel(obj);

        m.c = 'testing';
        m.d = 'Hello World';

        expect(JSON.stringify(m)).to.equal('{"a":"aa","c":"testing"}');

        expect('' + m).to.equal('{"a":"aa","c":"testing"}');

        done();
    });

    it('does not allow an invalid schema object when creating a model', function(done) {

        var schema = "bad object";

        var err;
        try {
            var SchemaModel = joiModel(schema);
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;

        done();
    });

});