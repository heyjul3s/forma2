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
    			hint: 'Please fill in this field.'
    		},

    		'name' : {
    			test: function(value) {
    				var re = /^[a-z0-9_\-]+$/i;
    				return re.test(value);
    			},
                errorMsg : ' field has prohibited characters',
    			hint: 'Only " - ", " _ " and alphanumerics are allowed.'
    		},

    		'email': {
    			test: function(value) {
    				var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
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
            validateSingleField : function(config, labelWidths) {

        		let errorTxt = '',
                    errorMsg = '';

        		config.some(function(el, i){
        			let parent    = el.ctrl.parentNode,
                        hint      = parent.querySelector('span.hint'),
                        label     = el.ctrl.nextElementSibling,
                        labelName = label.getAttribute('for'),
                        msg 	  = label.querySelector('span.msg');

        			if ( !scope.validator.confirmField(el) ) {
        				errorTxt += el.check.hint;
                        errorMsg += el.check.errorMsg;

                        //TODO: MutationObserver
                        // msg.classList.add('pre-visible');
                        // // window.getComputedStyle(msg);
                        // var observer = new MutationObserver(msg);

                        scope.interface.readyErrorResponse(msg, labelWidths[labelName], errorMsg, 'visible' );

                        // msg.textContent = errorMsg;
                        // scope.helper.addClass(msg, 'visible');
                        // msg.style.left = labelWidths[labelName] + 'px';

                        hint.textContent = errorTxt;
                        scope.helper.addClass(hint, 'visible');

                        scope.helper.addClass(parent, 'error');
                        scope.helper.removeClass(parent, 'success');

        				return errorTxt;
        			} else if ( config.every(scope.validator.confirmField) ) {

                        scope.helper.addClass(parent, 'success');
                        scope.helper.removeClass(parent, 'error');

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


        scope.interface = {
            getLabelWidth : function( textObject ) {
                let labelWidth = {};

                if (textObject === Object(textObject) && !Array.isArray(textObject)) {

                   Object.keys(textObject).forEach(function (key) {
                       //TODO: destructure
                       var label = textObject[key],
                           labelBoundingRect = label.getBoundingClientRect(),
                           objKey = label.getAttribute('for'),
                           value = labelBoundingRect.width;

                       labelWidth[objKey] = value;
                   });
                }

                return labelWidth;
            },

            //TODO: too flimsy, fix
            readyErrorResponse : function(element, offsetX, text, klass) {
                element.textContent = text;
                scope.helper.addClass(element, klass);
                element.style.left = offsetX + 'px';
            }
        };

        scope.counter = {

            setup : function(el, counter){
                let maxLength;

                if ( el.hasAttribute('max-length') ) {
                    maxLength = el.getAttribute('max-length');

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

            //TODO: fix, not disabling
            //disable submit functionality on load
            scope.validator.noSubmit( document.querySelector('#submit') );

            //setup char counter
            scope.helper.addEventListeners(forma,'focus keyup keydown', function(ev){
                scope.counter.setup(
                    ev.target,
                    ev.target.parentNode.querySelector('span.char-count')
                );
            });

            /**
             * blur events responsible for performing actual input data validation
             * @param {[type]} 'blur'      [description]
             * @param {[type]} function(ev [description]
             */
            forma.addEventListener('blur', function(ev){
                let formaConfig = scope.validator.processFieldsValidation( scope.config );

                scope.validator.isSubmitable( scope.validator.validateAllFields(formaConfig, ev ) );
                scope.validator.validateSingleField( scope.validator.processFieldValidation(formaConfig, ev), labelWidths );
                scope.counter.hide( ev.target.parentNode.querySelector('span.char-count') );
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

                    // fieldReady	    	   ('msg', target.nextElementSibling);
                    fieldReady	    	   ('msg', target.nextElementSibling);
        			fieldReady	    	   ('hint', parent);
                    neutraliseField 	   (parent);
                    neutraliseField 	   (parent.querySelector('span.msg'));
                    neutraliseField 	   (grandparent.querySelector('span.hint'));
                    scope.counter.show     ( parent.querySelector('span.char-count') );

            }, true);

        };

        return scope;
    };

    window.forma = Forma();

    document.addEventListener('DOMContentLoaded', function() {
        forma.init();
    }, false);

}(window, document));
