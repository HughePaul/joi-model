joi-model
=========

Model encapsulation of a Joi schema

[![Build Status](https://secure.travis-ci.org/HughePaul/joi-model.png)](http://travis-ci.org/HughePaul/joi-model)

# Usage

First create a schema

```javascript
var Joi = require('joi');

var schema = {
    a: Joi.string().required(),
    b: Joi.string().min(4)
};
```

Create a model class for that schema:

```javascript
var joiModel = require('joi-model');

var MyModel = joiModel(schema);
```

Create a document based on the model:

```javascript
var document = new MyModel();
```

Manipulate the document:

```javascript

document.setData({
    a: 'hello',
    b: 'world'
});

document.updateData({
    a: 'hello',
});

document.a = 'test';
document.b = 'another';

document.a = 3; // throws a type error

document.a = null; // throws a required error

document.b = 'hel'; // throws a length error

JSON.stringify(document); // '{"a":"test","b":"another"}'

```

The object is validated after each action and will throw any errors that are found.

Data can also be set to the document as it is created:

```javascript
var document = new MyModel({
    a: 'hello',
    b: 'world'
});
```

# More Complex Objects


```javascript
var Joi = require('joi');
var joiModel = require('joi-model');

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


// this push will throw an error as this would be the 5th child

family.children.push({
    name: 'Missy',
    age: 1.5
});

```

