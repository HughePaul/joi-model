joi-model
=========

Model encapsulation of a Joi schema

[![Build Status](https://secure.travis-ci.org/hughepaul/joi-model.png)](http://travis-ci.org/hughepaul/joi-model)

# Usage

First create a schema

```javascript
var Joi = require('joi');

var schema = {
    a: Joi.string().required(),
    b: Joi.string().min(4)
};
```

Then create a model class for that schema:

```javascript
var joiModel = require('joi-model');

var MyModel = joiModel(schema);
```

Then then create a document based on the model:

```javascript
var document = new MyModel();

document.setData({
    a: 'hello',
    b: 'world'
});

document.a = 'test';
document.b = 'another';

document.a = 3; // throws a type error

document.a = null; // throws a required error

document.b = 'hel'; // throws a length error

JSON.stringify(document); // '{"a":"test","b":"another"}'

var document = new MyModel({
    a: 'hello',
    b: 'world'
});

```