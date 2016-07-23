(function(window, document){
    'use strict';

    let Forma = function() {
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
            addEventListeners : function(el, str, fn) {
                let events = str.split(' '),
                    i = 0;

                for ( i; i < events.length; i += 1 ) {
                    el.addEventListener(events[i], fn, true);
                }
            },

            addClass : function(element, klassName) {
                let klass = klassName.trim();

                if ( !element.classList.contains(klass) ) {
                    element.classList.add(klass);
                }
            },

            removeClass : function(element, klassName) {
                let klass = klassName.trim();

                if ( element.classList.contains(klass) ) {
                    element.classList.remove(klass);
                }
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
            }
        };


        /**
         * Validation type configuration containing validation functions
         * @type {Object}
         */
        scope.validationType = {
            'required': {
    			test: function(val) {
    				let emptyString = scope.helper.isString(val) && val.trim() === '';
    				return val !== undefined && val !== null && !emptyString;
    			},
                errorMsg : ' field is empty',
    			hint: 'Please fill in this field.'
    		},

    		'name' : {
    			test: function(value) {
    				let re = /^[a-z0-9_\-]+$/i;
    				return re.test(value);
    			},
                errorMsg : ' field has prohibited characters',
    			hint: 'Only " - ", " _ " and alphanumerics are allowed.'
    		},

    		'email': {
    			test: function(value) {
    				let re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    				return re.test(value);
    			},
                errorMsg : ' field address is invalid',
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
             * Bundle all configs together
             * @param  {[type]} config [description]
             * @return {[type]}        [description]
             */
        	setup : function(config) {
        		let inputMandate  = [];

                //TODO: convert loop to ...
                // for (let [k, v] of Object.entries(config)) {
                //      // do something with k and v
                // }

                for (let key in config) {
        			if (config.hasOwnProperty(key)) {
        				let checks = scope.configurator.checkArray(config[key]);

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

            setupField : function(element, cl, parent) {
                //TODO: what if more than one class? add conditional
        		let theElement = element + '.' + cl;

        		if ( !parent.contains(parent.querySelector(theElement)) ) {
        			scope.helper.createElement( element, {
        				className: cl,
        				appendTo: parent
        			});
        		}
        	},

            confirmField : function(el) {
                if ( scope.helper.isString(el.value) ) return el.check.test(scope.helper.stripTags(el.value)) === true;
            },

            confirmAllFields : function( el, i ,validationList ) {
                return el === true;
            },

            disableSubmit : function(el) {
                el.disabled = true;
            },


            /**
             * return input to its original neutral state
             * @param  {[string]} removals : a string of class names to remove
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
                    for (let i = 0; i < toRemove.length; i += 1) {
                        elemClasses.some(function(cl, j){
                            if ( cl === toRemove[i] ) {
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

        			let fields = checks[i];

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

                for (let i = 0; i < config.length; i += 1) {
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
                let inputField = ev.target,
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
            validateSingleField : function(config, labelWidths) {

        		let errorTxt = '',
                    errorMsg = '';

        		config.some(function(el, i){
        			let parent    = el.ctrl.parentNode,
                        hint      = parent.querySelector('span.hint'),
                        label     = el.ctrl.nextElementSibling,
                        labelName = label.getAttribute('for'),
                        icon      = parent.querySelector('.input-icon'),
                        msg 	  = label.querySelector('span.msg');

                    //If fail test
                    if ( el.type !== 'submit' ) {

                        if ( !scope.validator.confirmField(el) ) {
                            errorTxt += el.check.hint;
                            errorMsg += el.check.errorMsg;

                            scope.interface.readyErrorResponse(msg, labelWidths[labelName], errorMsg, 'visible' );

                            scope.helper.addClass(icon, 'visible');

                            hint.textContent = errorTxt;
                            hint.classList.add('visible');

                            scope.helper.addClass(parent, 'error');
                            scope.helper.removeClass(parent, 'success');

                            return errorTxt;

                        //If pass all tests
                        } else if ( config.every(scope.validator.confirmField) ) {
                            scope.helper.addClass(parent, 'success');
                            scope.helper.removeClass(parent, 'error');
                            scope.helper.addClass(icon, 'success');

                            return true;
                        } else {
                            return false;
                        }

                    }
        		});
        	},


            /**
             * if not all fields valid, disable otherwise enable
             * @param  {[array]} validationList [description]
             */
            isSubmitable : function(validationList) {

                let promise = new Promise(function(resolve, reject){
                    if ( validationList.every(scope.validator.confirmAllFields) ) {
                        resolve(validationList);
                    } else {
                        reject(validationList);
                    }
                });

                promise.then(function(){
                    document.querySelector('.btn-submit').disabled = false;

                    if ( document.querySelector('.btn-submit').classList.contains('disabled') ) {
                        document.querySelector('.btn-submit').classList.remove('disabled');
                        document.querySelector('.btn-submit').classList.add('enabled');
                    }
                }).catch(function(){
                    document.querySelector('.btn-submit').disabled = true;

                    if ( !document.querySelector('.btn-submit').classList.contains('disabled') ) {
                        document.querySelector('.btn-submit').classList.remove('enabled');
                        document.querySelector('.btn-submit').classList.add('disabled');
                    }
                });
            }
        };


        scope.interface = {
            /**
             * get all label widths
             * @param  {[object]} textObject : list of labels
             * @return {[object]}            : object with input name as key and matching width value
             */
            getLabelWidth : function( textObject ) {
                let labelWidth = {};

                if (textObject === Object(textObject) && !Array.isArray(textObject)) {

                   Object.keys(textObject).forEach(function (key) {
                       //TODO: destructure
                       let label = textObject[key],
                           labelBoundingRect = label.getBoundingClientRect(),
                           objKey = label.getAttribute('for'),
                           value = labelBoundingRect.width;

                       labelWidth[objKey] = value;
                   });
                }

                return labelWidth;
            },

            readyErrorResponse : function(element, offsetX, text, klass) {
                element.textContent = text;
                scope.helper.addClass(element, klass);
                element.style.left = offsetX + 'px';
            }
        };

        scope.counter = {

            setup : function(el, counter){

                if ( el.hasAttribute('max-length') ) {
                    let maxLength = el.getAttribute('max-length');

                    if ( !!maxLength && el.value.length > maxLength ) {
                        el.value = el.value.substring(0, maxLength);
                    } else {
                        counter.textContent = maxLength - el.value.length;
                    }
                }

            },

            show : function(counter) {
                if ( !counter.classList.contains('active') ) {
                    counter.classList.add('active');
                }
            },

            hide : function(counter) {
                if ( counter.classList.contains('active') ) {
                    counter.classList.remove('active');
                }
            }
        };


        /**
         * invoke all required functionality
         * @return {[type]} [description]
         */
        scope.init = function() {
            let forma = scope.form.id('.forma');

            let labelWidths = scope.interface.getLabelWidth(document.querySelectorAll('label'));

            //disable submit functionality on load
            scope.validator.disableSubmit( document.querySelector('.btn-submit') );

            //setup char counter
            scope.helper.addEventListeners(forma,'focus keyup keydown', function(ev){

                scope.counter.setup(
                    ev.target,
                    ev.target.parentNode.querySelector('span.char-counter')
                );

            });

            /**
             * blur events responsible for performing actual input data validation
             * @param {[type]} 'blur'      : event type
             * @param {[type]} function(ev)
             */
            forma.addEventListener('blur', function(ev){

                let formaConfig = scope.validator.processFieldsValidation( scope.config );

                scope.validator.isSubmitable( scope.validator.validateAllFields(formaConfig, ev ) );
                scope.validator.validateSingleField( scope.validator.processFieldValidation(formaConfig, ev), labelWidths );
                scope.counter.hide( ev.target.parentNode.querySelector('span.char-counter') );

            }, true);


            /**
             * Focus event is responsible for setting up all necessary requirements for validation
             * @param {[type]} 'focus'     : event type
             * @param {[type]} function(ev)
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
                    neutraliseField 	   (parent.querySelector('span.input-icon'));
                    neutraliseField 	   (parent.querySelector('span.msg'));
                    neutraliseField 	   (parent.querySelector('span.hint'));
                    scope.counter.show     (parent.querySelector('span.char-counter') );

            }, true);

        };

        return scope;
    };

    window.forma = Forma();

    document.addEventListener('DOMContentLoaded', function() {
        forma.init();
    }, false);

}(window, document));
