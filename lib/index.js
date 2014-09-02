var Joi = require('joi');
var _ = require('lodash');

var JoiArray = require('./joiarray');

var joiModel = function(schema, options) {
    if (!schema.describe) {
        schema = Joi.object(schema);
    }

    var properties = {};
    _.forEach(schema._inner.children, function(child) {
        var name = child.key;
        var def = child.schema;
        // check each valid value of an array of values
        _.forEach(Array.isArray(def) ? def : [def], function(aDef) {
            if (!aDef || !aDef.describe) {
                throw new Error('joiModel requires a Joi schema: ' + name);
            }
        });

        // create sub-model definition if this property should be an object
        if (def._type === 'object' && !def._model) {
            def._model = joiModel(def);
        }

        properties[name] = {
            get: function() {
                return this._values[name];
            },
            set: function(val) {
                var self = this;
                if (def._model) {
                    if(typeof val === 'object') {
                        _.forEach(val, function(childVal, key) {
                            self._values[name][key] = childVal;
                        });
                        return;
                    } else {
                        val = new(def._model)(val);
                    }
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
                var result = Joi.validate(this._values, schema, options);
                if (result.error) {
                    this._values[name] = oldValue;
                    throw result.error;
                } else {
                    if(def._model) {
                        this._values[name] = new(def._model)(result.value[name]);
                    } else if (def._type === 'array') {
                        this._values[name] = new JoiArray(def, options, result.value[name]);
                    } else {
                        this._values[name] = result.value[name];
                    }
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
        var result = Joi.validate(data, schema, options);
        if(result.error) {
            throw(result.error);
        }
        return this;
    };
    constructor.prototype.setData = function(data, update) {
        var self = this;
        var copy = _.clone(this._values);
        _.forEach(schema._inner.children, function(child) {
            var name = child.key;
            var def = child.schema;
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
        return this;
    };
    constructor.prototype.updateData = function(data) {
        return this.setData(data, true);
    };

    return constructor;
};


module.exports = joiModel;