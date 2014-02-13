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


    it('allows multiple types to be specified for a property', function(done) {

        var schema = {
            username: Joi.string().alphanum().min(3).max(30).with('birthyear').required(),
            password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).without('access_token'),
            access_token: [Joi.string(), Joi.number()],
            birthyear: Joi.number().integer().min(1900).max(2013),
            email: Joi.string().email()
        };

        var SchemaModel = joiModel(schema);

        var m = new SchemaModel({
            username: 'abc',
            birthyear: 1994
        });

        expect(m.birthyear).to.equal(1994);

        done();
    });

    it('will load in data to a model including arrays of objects', function(done) {

        var schema = {
            name: Joi.string(),
            children: Joi.array().includes(Joi.object({
                name: Joi.string().required(),
                age: Joi.number().required()
            }))
        };

        var MyModel = joiModel(schema);

        var m = new MyModel({
            name: 'Paul',
            children: [{
                name: 'Arnald',
                age: 10
            }, {
                name: 'Fred',
                age: 12
            }]
        });

        m.children = [{
            name: 'Mandy',
            age: 11
        }, {
            name: 'Lucy',
            age: 13
        }];

        done();
    });

    it('will throw an error if an array object doesnt match the model', function(done) {

        var schema = {
            name: Joi.string(),
            children: Joi.array().includes(Joi.object({
                name: Joi.string().required(),
                age: Joi.number().required()
            }))
        };

        var MyModel = joiModel(schema);

        var m = new MyModel({
            name: 'Brad'
        });

        m.children = [{
            name: 'Mandy',
            age: 11
        }, {
            name: 'Lucy',
            age: 12
        }];

        m.children[0].age = 14;
        var err;
        try {
            m.children[1].age = 'test';
        } catch (e) {
            err = e;
        }

        expect(err).to.exist;
        expect(err.message).to.contain('must be a number');

        done();
    });

    it('should remove items by setting them to undefined', function(done) {

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

        m.a = undefined;

        expect(m.a).to.not.exist;

        m.setData({
            a: 1,
            c: undefined
        });

        expect(m.c).to.not.exist;

        delete m.a;

        expect(m.a).to.exist;

        done();
    });

    it('should be able to process a complex schema and throw an error when a condition is not met', function(done) {

        var adult = Joi.object({
            name: Joi.string().required(),
            job: Joi.string()
        });

        var child = Joi.object({
            name: Joi.string().required(),
            age: Joi.number().min(0).max(17).required()
        });

        var family = Joi.object({
            surname: Joi.string().required(),
            adults: Joi.array().includes(adult).min(1).max(2).required(),
            children: Joi.array().includes(child).max(4)
        });

        var FamilyModel = joiModel(family);

        var family = new FamilyModel({
            surname: 'Smith',
            adults: [{
                name: 'John',
                job: 'Clerk'
            }, {
                name: 'Jane',
                job: 'Programmer'
            }],
            children: [{
                name: 'Jimmy',
                age: 3
            }, {
                name: 'Jenny',
                age: 5
            }]
        });

        family.children.push({
            name: 'Betty',
            age: 3
        });

        family.children.push({
            name: 'Harry',
            age: 2
        });

        var err;
        try {
            family.children.push({
                name: 'Missy',
                age: 1.5
            });
        } catch(e) {
            err = e;
        }

        expect(err).to.exist;
        expect(err.message).to.contain('must include less than (or equal to) 4 items');

        done();
    });

});