var Joi = require('joi');
var _ = require('lodash');

var joiModel = function(schema, options) {
    if (!schema.describe) {
        schema = Joi.object(schema);
    }

    var properties = {};
    _.forEach(schema._children, function(def, name) {
        if (!def || !def.describe) {
            throw new Error('joiModel requires a Joi schema: ' + name);
        }
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
                var oldValue = this._values[name];
                this._values[name] = val;
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
    constructor.prototype.validate = function() {
        var err = Joi.validate(this._values, schema, options);
        return this;
    };
    constructor.prototype.setData = function(data) {
        var self = this;
        _.forEach(schema._children, function(def, name) {
            var val = data[name];
            if (def._model) {
                val = new(def._model)(val);
            }
            self._values[name] = val;
        });
        this.validate();
        return this;
    };

    return constructor;
};


module.exports = joiModel;