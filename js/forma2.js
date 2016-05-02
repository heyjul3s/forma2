(function(window, document){
    'use strict';

    //TODO: add parameter defaults?
    var Forma = function() {
        let scope = {};

         /**
         * Selectors
         * @type {Object}
         */
        scope.form = {
            id : function(formID) {
                return document.querySelector(formID);
            }
        };

        /**
         * helper functions
         * @type {Object}
         */
        scope.helper = {
            isArray : function(arr) {
                return Array.isArray(arr);
            },

            isString : function(str) {
                return Object.prototype.toString.call(str) === '[object String]';
            },

            isDefined : function(arg) {
                return arg && typeof arg !== 'undefined';
            },

            isObject : function(obj) {
                if ( obj === null ) { return false; }
                return (obj === Object(obj) && !Array.isArray(obj) );
            },

            isEmptyObject : function(obj) {
                return Object.keys(obj).length !== 0;
            },

            stripTags : function(value) {
                return String(value)
                        .replace( /&/g, '&amp;'  )
                        .replace( /</g, '&lt;'   )
                        .replace( />/g, '&gt;'   )
                        .replace( /"/g, '&quot;' );
            },

            createElement : function(tag, options) {
                let el = document.createElement(tag);

                if (options){
                    if (options.className) el.className = options.className;
                    if (options.appendTo) options.appendTo.appendChild(el);
                }
                return el;
            },

            //adds multiple event listeners to an element
            addEventListeners : function(el, s, fn) {
                let events = s.split(' '),
                    i = events.length;

                do {
                    el.addEventListener(events[i], fn, true);
                } while ( i -= 1 );
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
    				var emptyString = scope.helper.isString(val) && val.trim() === '';
    				return val !== undefined && val !== null && !emptyString;
    			},
                errorMsg : ' field is empty',
    			hint: 'Please enter details.'
    		},

    		'name' : {
    			test: function(value) {
    				var re = /^[a-z0-9_\-]+$/i;
    				return re.test(value);
    			},
                errorMsg : ' field has prohibited characters',
    			hint: 'Use " - ", " _ " and alphanumerics only.'
    		},

    		'email': {
    			test: function(value) {
    				var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    				return re.test(value);
    			},
                errorMsg : ' field is invalid',
    			hint: 'Please try entering input ie. my@email.com'
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
        	getValidations : function(check) {
        		if ( scope.helper.isString(check) && (scope.validationType[check]) ) {
        			return scope.validationType[check];
        		}
        	},


            /**
             * [function description]
             * @param  {[type]} config [description]
             * @return {[type]}        [description]
             */
        	setup : function(config) {
        		let inputMandate  = [];

                //TODO: convert loop to ...
                // for (let [k, v] of Object.entries(config)) {
                //      // do something with k and v
                // }

                for (var key in config) {
        			if (config.hasOwnProperty(key)) {
        				var checks = scope.configurator.checkArray(config[key]);

        				checks.forEach(function(check, i){
        					inputMandate.push({
        						ctrl: document.querySelector('.' + key),
        						check: scope.configurator.getValidations(check)
        					});
        				});
        			}
        		}


        		return inputMandate;
        	}
        };


        scope.validator = {

            setupField : function(elCreate, cl, parent) {
        		let elExist = elCreate + '.' + cl;

        		if ( !parent.contains(parent.querySelector(elExist)) ) {
        			scope.helper.createElement( elCreate, {
        				className: cl,
        				appendTo: parent
        			});
        		}
        	},

            confirmField : function(el) {
                if ( scope.helper.isString(el.value) ) return el.check.test(scope.helper.stripTags(el.value)) === true;
            },

            allTrue : function( el, i ,validationList ) {
                return el === true;
            },

            noSubmit : function(el) {
                el.disabled = true;
            },


            /**
             * return input to its original neutral state
             * @param  {[type]} removals [description]
             * @param  {[type]} el       [description]
             * @return {[type]}          [description]
             */
            isNeutral : function(removals, el) {
                let elem = el,
                    elemClasses = [].slice.call(elem.classList),
                    toRemove = removals.split(' ');

                if ( el === undefined || el === null ) {
                    return;
                } else {
                    for (var i = 0; i < toRemove.length; i += 1) {
                        elemClasses.some(function(cl, j){
                            if (cl === toRemove[i]) {
                                elem.classList.remove(cl);
                            } else {
                                return;
                            }
                        });
                    }
                }
            },


            /**
             * return all fields with configs in array validationList
             * @param  {[type]} config [description]
             * @return {[type]}        [description]
             */
        	processFieldsValidation : function(config) {
        		let configuration  = scope.configurator.setup(config),
        		    checks         = [],
        			validationList = [];

        		configuration.forEach(function(field, i){
        			checks.push(field);

        			var fields = checks[i];

        			validationList.push({
        				ctrl  : fields.ctrl,
        				value : fields.ctrl.value,
        				check : fields.check
        			});
        		});

        		return validationList;
        	},


            /**
             * filter configs not specific to field for use in single field validation
             * @param  {[type]} config [description]
             * @param  {[type]} ev     [description]
             * @return {[type]}        [description]
             */
            processFieldValidation : function(config, ev) {
                let inputField = ev.target,
                    fieldValObj = [];

                for (var i = 0; i < config.length; i += 1) {
                    if (config[i].ctrl === inputField) {
                        fieldValObj.push(config[i]);
                    }
                }
                return fieldValObj;
            },


            /**
             * validates all fields. used to confirm valid form fields before allowing submit
             * @param  {[type]} config [description]
             * @param  {[type]} ev     [description]
             * @return {[type]}        [description]
             */
            validateAllFields : function(config, ev){
                var inputField = ev.target,
                    results = [];

                config.forEach(function(field, i){
                    results.push(scope.validator.confirmField(field));
                });

                return results;
            },


            /**
             * executes validation function on targeted single Field
             * @param  {[type]} config [description]
             * @return {[type]}        [description]
             */
            validateSingleField : function(config) {
                //TODO: error msg append to label

        		let errorTxt = '',
                    errorMsg = '';

        		config.some(function(el, i){
        			let hint      = el.ctrl.parentNode.querySelector('span.hint'),
                        label     = el.ctrl.nextElementSibling,
                        msg 	  = label.querySelector('span.msg');

        			if ( !scope.validator.confirmField(el) ) {
        				errorTxt += el.check.hint;
                        errorMsg += el.check.errorMsg;

                        msg.textContent = errorMsg;
                        msg.classList.add('visible');

        				hint.textContent = errorTxt;
                        hint.classList.add('visible');

                        if ( !el.ctrl.parentNode.classList.contains('error') ) {
                            el.ctrl.parentNode.classList.add('error');
                        }

                        // console.log(el.ctrl.parentNode.classList.contains('success') );

                        if ( el.ctrl.parentNode.classList.contains('success') ) {
                            el.ctrl.parentNode.classList.remove('success');
                        }

        				return errorTxt;
        			} else if ( config.every(scope.validator.confirmField) ) {
                        //TODO: add 'success' class
                        //

                        if ( el.ctrl.parentNode.classList.contains('error') ) {
                            el.ctrl.parentNode.classList.remove('error');
                        }

                        if ( !el.ctrl.parentNode.classList.contains('success') ) {
                            el.ctrl.parentNode.classList.add('success');
                        }

        				return true;
        			}
        		});
        	},


            /**
             * if not all fields valid, disable otherwise enable
             * @param  {[type]} validationList [description]
             * @return {[type]}                [description]
             */
            isSubmitable : function(validationList) {

                let promise = new Promise(function(resolve, reject){
                    if ( validationList.every(validator.allTrue) ) {
                        resolve(validationList);
                    } else {
                        reject(validationList);
                    }
                });

                promise.then(function(){
                    document.querySelector('#submit').disabled = false;

                    if ( document.querySelector('#submit').classList.contains('disabled') ) {
                        document.querySelector('#submit').classList.remove('disabled');
                        document.querySelector('#submit').classList.add('enabled');
                    }

                }).catch(function(){
                    document.querySelector('#submit').disabled = false;

                    if ( !document.querySelector('#submit').classList.contains('disabled') ) {
                        document.querySelector('#submit').classList.remove('enabled');
                        document.querySelector('#submit').classList.add('disabled');
                    }

                });
            }
        };


        /**
         * invoke all required functionality
         * @return {[type]} [description]
         */
        scope.init = function() {
            let forma = scope.form.id('.forma');

            //disable submit functionality on load
            scope.validator.noSubmit( document.querySelector('#submit') );

            //TODO: setup counter function before use
            // scope.addEventListeners(forma,'focus keyup keydown', function(ev){
            //     charCount.setupCounter(
            //         ev.target,
            //         ev.target.parentNode.querySelector('span.char-count');
            //     );
            // });


            /**
             * blur events responsible for performing actual input data validation
             * @param {[type]} 'blur'      [description]
             * @param {[type]} function(ev [description]
             */
            forma.addEventListener('blur', function(ev){
                let formaConfig = scope.validator.processFieldsValidation( scope.config );

                scope.validator.isSubmitable( scope.validator.validateAllFields(formaConfig, ev ));
                scope.validator.validateSingleField( scope.validator.processFieldValidation(formaConfig, ev));
                // charCount.hideCounter	( $qr(forma.targetParent(ev), 'span.char-count') );
            }, true);


            /**
             * Focus event is responsible for setting up all necessary requirements for validation
             * @param {[type]} 'focus'     [description]
             * @param {[type]} function(ev [description]
             */
            forma.addEventListener('focus', function(ev){

                let target 			= ev.target,
                    parent 			= target.parentNode,
                    grandparent 	= parent.parentNode,
                    fieldReady 		= scope.validator.setupField.bind(this, 'span'),
                    neutraliseField = scope.validator.isNeutral.bind(this, 'error success visible');

                    fieldReady	    	   ('msg', target.nextElementSibling);
        			fieldReady	    	   ('hint', parent);
                    neutraliseField 	   (parent);
                    neutraliseField 	   (parent.querySelector('span.msg'));
                    neutraliseField 	   (grandparent.querySelector('span.hint'));

            }, true);

        };

        return scope;
    };

    window.forma = Forma();

    document.addEventListener('DOMContentLoaded', function() {
        forma.init();
    }, false);

}(window, document));
