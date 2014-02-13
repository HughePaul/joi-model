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

Then create a model class for that schema:

```javascript
var joiModel = require('joi-model');

var MyModel = joiModel(schema);
```

Then then create a document based on the model:

```javascript
var document = new MyModel();
```

Then manipulate the document:

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