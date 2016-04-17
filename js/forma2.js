(function(window, document){
    'use strict';

    //1 - config
    //2 - configurator
    //3 - validator
    //4 - init

    //TODO: add parameter defaults?
    var Forma = function(spec, config) {
        let scope = {};

        /**
         * Selectors
         * @type {Object}
         */
        scope.form = {
            id : function(id) {
                return document.getElementById(id);
            },

            target : function(ev) {
                return ev.target;
            },

            targetParent : function(ev) {
                return ev.target.parentNode;
            }
        };

        /**
         * helper functions
         * @type {Object}
         */

         addClass    : ( el, cl ) => el.classList.add(cl.trim()),
         removeClass : ( el, cl ) => el.classList.remove(cl.trim()),
         toggleClass : ( el, cl ) => el.classList.toggle(cl.trim()),
         hasClass    : ( el, cl ) => el.classList.contains(cl.trim()),
         swapClass   : ( el, cl ) => util.klass.hasClass(el, cl) ? util.klass.removeClass(el, cl) : util.klass.addClass(el, cl)


        scope.helper = {
            isArray         : (arr) => Array.isArray(arr),
            isString        : (str) => Object.prototype.toString.call(str) === '[object String]'),
            isDefined       : (arg) => typeof arg !== 'undefined' && arg,
            objectIsEmpty   : (obj) => Object.keys(obj).length !== 0,

            //TODO: validate functions?
            isObject        : function(obj) {
                if ( obj === null ) { return false; }
                return (obj === Object(obj) && !Array.isArray(obj) );
            }
        };


        /**
         * Input validation configuration object that list validation checks required for fields
         * @type {Object}
         */
        scope.config = {
            'name' : {
                checks : ['required', 'name'],
                field : 'name'
            },

            'email' : {
                checks : ['required', 'email'],
                field : 'e-mail'
            },

            'comment' : {
                checks : ['required'],
                field : 'comment'
            }
        };


        /**
         * Validation type configuration containing validation functions
         * @type {Object}
         */
        scope.validationType = {
            'required': {
    			test: function(val) {
    				var emptyString = isString(val) && val.trim() === '';
    				return val !== undefined && val !== null && !emptyString;
    			},
    			hint: 'This field required'
    		},

    		'name' : {
    			test: function(value) {
    				var re = /^[a-z0-9_\-]+$/i;
    				return re.test(value);
    			},
    			hint: 'Use " - ", " _ " and alphanumerics only.'
    		},

    		'email': {
    			test: function(value) {
    				var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    				return re.test(value);
    			},
    			hint: 'Enter ie. my@email.com'
    		}
        };


        scope.configurator = {

            /**
             * Check if arg is of data type array
             * @param  {[anything really]} arg
             * @return {[boolean]} returns boolean value
             */
            checkArray : function(arg) {
        		return Array.isArray(arg.checks) ? arg.checks : [arg.checks];
        	},


            /**
             * validate config
             * @param  {[type]} check  [description]
             * @param  {[type]} config [description]
             * @return {[type]}        [description]
             */
        	getValidations : function(check, config) {
        		if ( helper.isString(check) && (config.type[check]) ) {
        			return config.type[check];
        		}
        	},


            /**
             * [function description]
             * @param  {[type]} config [description]
             * @return {[type]}        [description]
             */
        	setup : function(config) {
        		let config    = config || {},
        		    inputObj  = [];

        	}
        };


        scope.init = function() {
        };

        return scope;
    };

}(window, document));
