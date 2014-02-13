var Joi = require('joi');

// pollyfill for EMCA6 method
var setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    };

var JoiArray = function(schema, options, data) {
    var array = Array.apply(null);
    setPrototypeOf(array, JoiArray.prototype);

    schema = schema || Joi.array();

    // look for model in includes rules
    var rules = schema._tests;
    var objectTypes = [];
    var otherTypes = [];
    for (var ri = 0; ri < rules.length; ri++) {
        if (rules[ri].name === 'includes') {
            for (var ti = 0; ti < rules[ri].arg.length; ti++) {
                var type = rules[ri].arg[ti];
                if (type._type === 'object') {
                    objectTypes.push(type);
                } else {
                    otherTypes.push(type);
                }
            }
        }
    }
    if (objectTypes.length && otherTypes.length) {
        throw new Error('joi-model does not support mixing object models with other types in arrays');
    }
    if (objectTypes.length > 1) {
        throw new Error('joi-model only supports one object model type per array');
    }

    var model;
    if (objectTypes.length === 1) {
        var joiModel = require('./');
        model = joiModel(objectTypes[0]);
    }

    Object.defineProperty(array, '_schema', {
        value: schema,
        enumerable: false,
        writable: false,
        configurable: false
    });
    Object.defineProperty(array, '_model', {
        value: model,
        enumerable: false,
        writable: false,
        configurable: false
    });
    Object.defineProperty(array, '_options', {
        value: options,
        enumerable: false,
        writable: false,
        configurable: false
    });

    if (Array.isArray(data)) {
        array.setData(data);
    }
    return array;
};
JoiArray.prototype = Object.create(Array.prototype);

// populate from a given array
JoiArray.prototype.setData = function(data) {
    this.push.apply(this, data);
};

// validate this array
JoiArray.prototype.validate = function(data) {
    var err = Joi.validate(data || this, this._schema, this._options);
    if (err) {
        throw err;
    }
};

// if there is a model for this array then create this model for this value
JoiArray.prototype.applyModel = function(item) {
    if (!this._model) {
        return item;
    }

    if (Array.isArray(item)) {
        for (var i = 0; i < item.length; i++) {
            item[i] = new(this._model)(item[i]);
        }
        return item;
    }
    return new(this._model)(item);
};

// override array push to set and validate the value
JoiArray.prototype.push = function() {
    var items = this.applyModel(Array.prototype.slice.call(arguments));
    var newArray = Array.prototype.concat.call([], this, items);
    this.validate(newArray);
    Array.prototype.push.apply(this, items);
    return this.length;
};

// override array unshift to set and validate the value
JoiArray.prototype.unshift = function() {
    var items = this.applyModel(Array.prototype.slice.call(arguments));
    var newArray = Array.prototype.concat.call([], items, this);
    this.validate(newArray);
    Array.prototype.unshift.apply(this, items);
    return this.length;
};

// override array pop to set and validate the value
JoiArray.prototype.pop = function() {
    var items = Array.prototype.slice.call(arguments);
    var newArray = Array.prototype.slice.call(this, 0, this.length - 1);
    this.validate(newArray);
    return Array.prototype.pop.apply(this);
};

// override array shift to set and validate the value
JoiArray.prototype.shift = function() {
    var items = Array.prototype.slice.call(arguments);
    var newArray = Array.prototype.slice.call(this, 1);
    this.validate(newArray);
    return Array.prototype.shift.apply(this);
};

// set an indexed value
JoiArray.prototype.set = function(index, value) {
    value = this.applyModel(value);
    var newArray = Array.prototype.slice.call(this);
    newArray[index] = value;
    this.validate(newArray);
    this[index] = value;
    return this;
};

// get an indexed value
JoiArray.prototype.get = function(index) {
    return this[index];
};

// override JSON and string methods
JoiArray.prototype.toJSON = function() {
    return Array.prototype.slice.apply(this);
};
JoiArray.prototype.toString = function() {
    return JSON.stringify(this.toJSON());
};

module.exports = JoiArray;

