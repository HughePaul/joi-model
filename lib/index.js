var Joi = require('joi');
var _ = require('lodash');

var JoiArray = require('./joiarray');

var joiModel = function(schema, options) {
    if (!schema.describe) {
        schema = Joi.object(schema);
    }

    var properties = {};
    _.forEach(schema._children, function(def, name) {
        // check each valid value of an array of values
        _.forEach(Array.isArray(def) ? def : [def], function(aDef) {
            if (!aDef || !aDef.describe) {
                throw new Error('joiModel requires a Joi schema: ' + name);
            }
        });

        // create sub-model definition if this property shuld be an object
        if (def._type === 'object' && !def._model) {
            def._model = joiModel(def);
        }

        properties[name] = {
            get: function() {
                return this._values[name];
            },
            set: function(val) {
                if (def._model) {
                    val = new(def._model)(val);
                }
                if (def._type === 'array') {
                    val = new JoiArray(def, options, val);
                }
                var oldValue = this._values[name];
                if(val === undefined) {
                    delete this._values[name];
                } else {
                    this._values[name] = val;
                }
                var err = Joi.validate(this._values, schema, options);
                if (err) {
                    this._values[name] = oldValue;
                    throw err;
                }
            },
            enumerable: true,
            configurable: false
        };
    });

    var constructor = function(data) {
        var values = {};
        Object.defineProperties(this, properties);
        Object.defineProperty(this, '_values', {
            get: function() {
                return values;
            },
            enumerable: false,
            configurable: false
        });
        if (data && typeof data === 'object') {
            this.setData(data);
        }
    };
    constructor.prototype.toJSON = function() {
        return this._values;
    };
    constructor.prototype.toString = function() {
        return JSON.stringify(this._values);
    };
    constructor.prototype.validate = function(data) {
        data = data || this._values;
        var err = Joi.validate(data, schema, options);
        if(err) {
            throw(err);
        }
        return this;
    };
    constructor.prototype.setData = function(data, update) {
        var self = this;
        var copy = _.clone(this._values);
        _.forEach(schema._children, function(def, name) {
            var val = data[name];
            if (update && val === undefined) {
                return;
            }
            if (def._model) {
                if(val) {
                    val = new(def._model)(val);
                } else {
                    val = undefined;
                }
            }
            if (def._type === 'array') {
                if(val) {
                    val = new JoiArray(def, options, val);
                } else {
                    val = undefined;
                }
            }
            copy[name] = val;
        });
        this.validate(copy);
        _.forEach(copy, function(value, name){
            if(value === undefined) {
                delete self._values[name];
            } else {
                self._values[name] = value;
            }
        });
        this._values = copy;
        return this;
    };
    constructor.prototype.updateData = function(data) {
        return this.setData(data, true);
    };

    return constructor;
};


module.exports = joiModel;