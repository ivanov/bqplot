/* Copyright 2015 Bloomberg Finance L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var d3 = require("d3");
var _ = require("underscore");
var scalemodel = require("./ScaleModel");

var LinearScaleModel = scalemodel.ScaleModel.extend({

    defaults: _.extend({}, scalemodel.ScaleModel.prototype.defaults, {
        _model_name: "LinearScaleModel",
         _view_name: "LinearScale",
        min: null,
        max: null
    }),

    initialize: function() {
        LinearScaleModel.__super__.initialize.apply(this, arguments);
        this.type = "linear";
        this.global_min = Number.NEGATIVE_INFINITY;
        this.global_max = Number.POSITIVE_INFINITY;
        this.on_some_change(["min", "max"], this.min_max_changed, this);
        this.min_max_changed();
        this.on("change:reverse", this.reverse_changed, this);
        this.reverse_changed();
    },

    min_max_changed: function() {
        this.min = this.get("min");
        this.max = this.get("max");
        this.min_from_data = (this.min === null);
        this.max_from_data = (this.max === null);
        this.update_domain();
    },

    reverse_changed: function() {
        this.reverse = this.get("reverse");
        if(this.domain.length > 0 && this.reverse) {
            this.domain.reverse();
            this.trigger("domain_changed", this.domain);
        }
    },

    update_domain: function() {
        var that = this;
        var min = (!this.min_from_data) ?
            this.min : d3.min(_.map(this.domains, function(d) {
                return d.length > 0 ? d[0] : that.global_max;
            }));
        var max = (!this.max_from_data) ?
            this.max : d3.max(_.map(this.domains, function(d) {
                return d.length > 1 ? d[1] : that.global_min;
            }));
        var prev_domain = this.domain;
        var min_index = (this.reverse) ? 1 : 0;
        if(min !== prev_domain[min_index] || max !== prev_domain[1 - min_index]) {
            this.domain = (this.reverse) ? [max, min] : [min, max];
            this.trigger("domain_changed", this.domain);
        }
    },

    compute_and_set_domain: function(data_array, id) {
        // Takes an array and calculates the domain for the particular
        // view. If you have the domain already calculated on your side,
        // call set_domain function.
        if(data_array.length === 0) {
           this.set_domain([], id);
           return;
        }
        var data = data_array[0] instanceof Array ?
            data_array : [data_array];
        var min = d3.min(data.map(function(d) { return d3.min(d); }));
        var max = d3.max(data.map(function(d) { return d3.max(d); }));
        this.set_domain([min, max], id);
    }
});

module.exports = {
    LinearScaleModel: LinearScaleModel,
};
