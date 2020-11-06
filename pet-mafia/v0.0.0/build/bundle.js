
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    class Router {
    	constructor() {
    		this.notfoundCallback = () => {};
    		this.routers = [];
    		
    		this.pathInfoWritable = writable( this.path );

    		this.path =  null;
    		this.pathInfo = null;
    		this._setPath('');		
    	}
    	
    	getPath() {
    		return this.pathInfo
    	}
    	
    	getPathWritable() {
    		return this.pathInfoWritable
    	}
    	
    	setNotFound(callback) {
    		this.notfoundCallback = callback;
    	}
    	add(regexp, callback) {
    		this.routers.push({ regexp, callback });
    	}
    	
    	_setPath(path) {
    		this.path = path;
    		const parts = path.split('/').map(decodeURI).slice(1);
    		this.pathInfo = {
    			path,
    			parts
    		};
    		
    		this.pathInfoWritable.set( this.pathInfo );
    	}
    	
    	async go(path, title = path, data = {}, push = true) {
    		if ( path === this.path )
    			return
    		
    		const router = this.routers.find(r => r.regexp.test(path));
    		if ( !router )
    			return this.notfoundCallback()

    		this._setPath( path );
    		
    		if ( push )
    			history.pushState(data, title, path);
    		
    		await tick();
    		router.callback();
    	}
    	
    	goWithoutPushState(path, title = path, data = {}) {
    		return this.go( path, title, data, false )
    	}
    }

    const router = new Router();

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\Header.svelte generated by Svelte v3.29.4 */
    const file = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\Header.svelte";

    function create_fragment(ctx) {
    	let div7;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div6;
    	let div4;
    	let t7;
    	let div5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Правила игры";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Посмотреть игру";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Контакты";
    			t5 = space();
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "Регистрация";
    			t7 = space();
    			div5 = element("div");
    			div5.textContent = "Забыли пароль";
    			attr_dev(div0, "class", "a svelte-16wvx70");
    			toggle_class(div0, "aActive", /*$pathInfoWritable*/ ctx[0].path === "/game-rules");
    			add_location(div0, file, 2, 2, 62);
    			attr_dev(div1, "class", "a svelte-16wvx70");
    			toggle_class(div1, "aActive", /*$pathInfoWritable*/ ctx[0].path === "/current-games");
    			add_location(div1, file, 3, 2, 203);
    			attr_dev(div2, "class", "a svelte-16wvx70");
    			add_location(div2, file, 4, 2, 352);
    			attr_dev(div3, "class", "flex cgap30 svelte-16wvx70");
    			add_location(div3, file, 1, 1, 32);
    			attr_dev(div4, "class", "a text_underline svelte-16wvx70");
    			add_location(div4, file, 8, 2, 427);
    			attr_dev(div5, "class", "a text_underline svelte-16wvx70");
    			add_location(div5, file, 9, 2, 479);
    			attr_dev(div6, "class", "flex cgap30 svelte-16wvx70");
    			add_location(div6, file, 7, 1, 397);
    			attr_dev(div7, "class", "container flex svelte-16wvx70");
    			add_location(div7, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div7, t5);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t7);
    			append_dev(div6, div5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$pathInfoWritable*/ 1) {
    				toggle_class(div0, "aActive", /*$pathInfoWritable*/ ctx[0].path === "/game-rules");
    			}

    			if (dirty & /*$pathInfoWritable*/ 1) {
    				toggle_class(div1, "aActive", /*$pathInfoWritable*/ ctx[0].path === "/current-games");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $pathInfoWritable;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const { pathInfoWritable } = router;
    	validate_store(pathInfoWritable, "pathInfoWritable");
    	component_subscribe($$self, pathInfoWritable, value => $$invalidate(0, $pathInfoWritable = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => router.go("/game-rules");
    	const click_handler_1 = () => router.go("/current-games");

    	$$self.$capture_state = () => ({
    		router,
    		pathInfoWritable,
    		$pathInfoWritable
    	});

    	return [$pathInfoWritable, pathInfoWritable, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\Footer.svelte generated by Svelte v3.29.4 */

    const file$1 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let div8;
    	let div7;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t11;
    	let div6;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			div0.textContent = "Статистика сервера:";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Партий в архиве:  1108979";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Победила мафия:  385157";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Победили честные:  711679";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "Ничьих:  10703";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "Сейчас онлайн:  50";
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "Активных игроков:  88582";
    			add_location(div0, file$1, 2, 2, 50);
    			add_location(div1, file$1, 3, 2, 84);
    			add_location(div2, file$1, 4, 2, 124);
    			add_location(div3, file$1, 5, 2, 162);
    			add_location(div4, file$1, 6, 2, 202);
    			add_location(div5, file$1, 7, 2, 231);
    			add_location(div6, file$1, 8, 2, 264);
    			attr_dev(div7, "class", "stat svelte-aub7nj");
    			add_location(div7, file$1, 1, 1, 27);
    			attr_dev(div8, "class", "container svelte-aub7nj");
    			add_location(div8, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div7, t1);
    			append_dev(div7, div1);
    			append_dev(div7, t3);
    			append_dev(div7, div2);
    			append_dev(div7, t5);
    			append_dev(div7, div3);
    			append_dev(div7, t7);
    			append_dev(div7, div4);
    			append_dev(div7, t9);
    			append_dev(div7, div5);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\MainLabel.svelte generated by Svelte v3.29.4 */

    const file$2 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\MainLabel.svelte";

    function create_fragment$2(ctx) {
    	let div4;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div3;
    	let div1;
    	let t3;
    	let div2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "MAFIA";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "ONLINE";
    			if (img.src !== (img_src_value = "/assets/images/9bde4ef8e544bea24923045e23b45be9.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1khwlrp");
    			add_location(img, file$2, 1, 2, 28);
    			attr_dev(div0, "class", "abs gradient svelte-1khwlrp");
    			add_location(div0, file$2, 3, 2, 101);
    			attr_dev(div1, "class", "mafia svelte-1khwlrp");
    			add_location(div1, file$2, 6, 3, 175);
    			attr_dev(div2, "class", "online svelte-1khwlrp");
    			add_location(div2, file$2, 8, 3, 212);
    			attr_dev(div3, "class", "containerLabel svelte-1khwlrp");
    			add_location(div3, file$2, 5, 2, 141);
    			attr_dev(div4, "class", "container svelte-1khwlrp");
    			add_location(div4, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, img);
    			append_dev(div4, t0);
    			append_dev(div4, div0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MainLabel", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MainLabel> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MainLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainLabel",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Plus.svelte generated by Svelte v3.29.4 */

    const file$3 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Plus.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "14" },
    		{ height: "14" },
    		{ viewBox: "0 0 14 14" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ fill: "black" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z");
    			add_location(path, file$3, 1, 1, 118);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "14" },
    				{ height: "14" },
    				{ viewBox: "0 0 14 14" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ fill: "black" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Plus", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Plus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Plus",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Plus2.svelte generated by Svelte v3.29.4 */

    const file$4 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Plus2.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "23" },
    		{ height: "23" },
    		{ viewBox: "0 0 23 23" },
    		{ fill: "#FF0000" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M13.6433 9.2217H23V13.0189H13.6433V23H9.35671V13.0189H0V9.2217H9.35671V0H13.6433V9.2217Z");
    			add_location(path, file$4, 1, 1, 119);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "23" },
    				{ height: "23" },
    				{ viewBox: "0 0 23 23" },
    				{ fill: "#FF0000" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Plus2", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Plus2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Plus2",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Close2.svelte generated by Svelte v3.29.4 */

    const file$5 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Close2.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "33" },
    		{ height: "33" },
    		{ viewBox: "0 0 33 33" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ fill: "#979797" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M16.0806 13.1412L22.5213 6.35413L25.2757 8.96793L18.835 15.755L26.075 22.6256L23.1243 25.735L15.8843 18.8644L9.44355 25.6515L6.68918 23.0377L13.1299 16.2506L6.44074 9.90282L9.39142 6.79345L16.0806 13.1412Z");
    			add_location(path, file$5, 1, 1, 120);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "33" },
    				{ height: "33" },
    				{ viewBox: "0 0 33 33" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ fill: "#979797" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Close2", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Close2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Close2",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\CurrentGames.svelte generated by Svelte v3.29.4 */
    const file$6 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\CurrentGames.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (32:6) {:else}
    function create_else_block(ctx) {
    	let iconplus2;
    	let current;

    	iconplus2 = new Plus2({
    			props: { style: "width: 23rem; height: 23rem;" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(iconplus2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconplus2, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconplus2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconplus2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconplus2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(32:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:6) {#if game.hasSelf }
    function create_if_block(ctx) {
    	let iconclose2;
    	let current;

    	iconclose2 = new Close2({
    			props: { style: "width: 35rem; height: 35rem;" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(iconclose2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconclose2, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconclose2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconclose2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconclose2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(30:6) {#if game.hasSelf }",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#each games as game}
    function create_each_block(ctx) {
    	let div11;
    	let div6;
    	let div3;
    	let div0;
    	let t0_value = /*formatDate*/ ctx[0](/*game*/ ctx[3].date) + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3_value = /*game*/ ctx[3].id + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5;
    	let t6_value = /*game*/ ctx[3].maxNumPlayers + "";
    	let t6;
    	let t7;
    	let div5;
    	let t8;
    	let t9_value = /*game*/ ctx[3].maxNumPlayers - /*game*/ ctx[3].players.length + "";
    	let t9;
    	let t10;
    	let div4;
    	let t11;
    	let current_block_type_index;
    	let if_block;
    	let t12;
    	let div9;
    	let div7;
    	let t13;
    	let div8;
    	let t14;
    	let div10;
    	let t15_value = /*game*/ ctx[3].players.join(", ") + "";
    	let t15;
    	let t16;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*game*/ ctx[3].hasSelf) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div6 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text("№");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = text("Макс. игроков: ");
    			t6 = text(t6_value);
    			t7 = space();
    			div5 = element("div");
    			t8 = text("Ожидает ");
    			t9 = text(t9_value);
    			t10 = text(" участников\r\n\t\t\t\t\t\t");
    			div4 = element("div");
    			t11 = space();
    			if_block.c();
    			t12 = space();
    			div9 = element("div");
    			div7 = element("div");
    			t13 = space();
    			div8 = element("div");
    			t14 = space();
    			div10 = element("div");
    			t15 = text(t15_value);
    			t16 = space();
    			add_location(div0, file$6, 21, 6, 580);
    			add_location(div1, file$6, 22, 6, 624);
    			add_location(div2, file$6, 23, 6, 655);
    			attr_dev(div3, "class", "gameItemInfoLabel svelte-1wxg5uq");
    			add_location(div3, file$6, 20, 5, 540);
    			set_style(div4, "width", "23rem");
    			add_location(div4, file$6, 28, 6, 842);
    			attr_dev(div5, "class", "gameItemInfoAction svelte-1wxg5uq");
    			add_location(div5, file$6, 26, 5, 730);
    			attr_dev(div6, "class", "gameItemInfo svelte-1wxg5uq");
    			add_location(div6, file$6, 19, 4, 506);
    			attr_dev(div7, "class", "gameItemProgressTrack svelte-1wxg5uq");
    			add_location(div7, file$6, 38, 5, 1125);
    			attr_dev(div8, "class", "gameItemProgressThumb svelte-1wxg5uq");
    			set_style(div8, "width", /*game*/ ctx[3].players.length / /*game*/ ctx[3].maxNumPlayers * 100 + "%");
    			add_location(div8, file$6, 39, 5, 1173);
    			attr_dev(div9, "class", "gameItemProgress svelte-1wxg5uq");
    			add_location(div9, file$6, 37, 4, 1087);
    			attr_dev(div10, "class", "gameItemPlayers svelte-1wxg5uq");
    			add_location(div10, file$6, 45, 4, 1330);
    			attr_dev(div11, "class", "gameItem svelte-1wxg5uq");
    			add_location(div11, file$6, 18, 3, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div6);
    			append_dev(div6, div3);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, t5);
    			append_dev(div2, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, t8);
    			append_dev(div5, t9);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div5, t11);
    			if_blocks[current_block_type_index].m(div5, null);
    			append_dev(div11, t12);
    			append_dev(div11, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div11, t14);
    			append_dev(div11, div10);
    			append_dev(div10, t15);
    			append_dev(div11, t16);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:2) {#each games as game}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div6;
    	let div1;
    	let div0;
    	let t1;
    	let button;
    	let iconplus;
    	let t2;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let current;

    	iconplus = new Plus({
    			props: { style: "width: 14px; height: 14px;" },
    			$$inline: true
    		});

    	let each_value = /*games*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Текущие игры";
    			t1 = space();
    			button = element("button");
    			create_component(iconplus.$$.fragment);
    			t2 = text("создать");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "currentGamesLabel svelte-1wxg5uq");
    			add_location(div0, file$6, 2, 2, 52);
    			attr_dev(button, "class", "createGameButton svelte-1wxg5uq");
    			add_location(button, file$6, 3, 2, 106);
    			attr_dev(div1, "class", "header svelte-1wxg5uq");
    			add_location(div1, file$6, 1, 1, 27);
    			set_style(div2, "height", "17rem");
    			add_location(div2, file$6, 5, 1, 215);
    			set_style(div3, "background", "#FFFFFF");
    			set_style(div3, "mix-blend-mode", "normal");
    			set_style(div3, "opacity", "0.12");
    			set_style(div3, "width", "100%");
    			set_style(div3, "height", "1px");
    			add_location(div3, file$6, 6, 1, 253);
    			set_style(div4, "height", "31rem");
    			add_location(div4, file$6, 14, 1, 383);
    			attr_dev(div5, "class", "gameList svelte-1wxg5uq");
    			add_location(div5, file$6, 16, 1, 424);
    			attr_dev(div6, "class", "container svelte-1wxg5uq");
    			add_location(div6, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			mount_component(iconplus, button, null);
    			append_dev(button, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div2);
    			append_dev(div6, t4);
    			append_dev(div6, div3);
    			append_dev(div6, t5);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*games, formatDate*/ 3) {
    				each_value = /*games*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div5, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconplus.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconplus.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(iconplus);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CurrentGames", slots, []);

    	const formatDate = date => {
    		const d = new Date(date);
    		const ps = n => (n + "").padStart(2, 0);
    		return [d.getDay() + 1, d.getMonth(), ps(d.getFullYear() % 2000)].map(ps).join(".") + " " + [d.getHours(), d.getMinutes(), d.getSeconds()].map(ps).join(":");
    	};

    	const getRndDate = () => Date.now() - (1000000 * Math.random() | 0);

    	let games = [
    		{
    			date: getRndDate(),
    			id: 35487,
    			maxNumPlayers: 11,
    			players: [
    				"Lupusregina[beta]",
    				"Den Ri",
    				"Зомби Ich bin Roboter",
    				"Bunk Bunkovich",
    				"Aleksander irreligious86",
    				"Chingiz Mam"
    			]
    		},
    		{
    			date: getRndDate(),
    			id: 35488,
    			maxNumPlayers: 11,
    			players: ["Зомби Ich bin Roboter"]
    		},
    		{
    			date: getRndDate(),
    			id: 35489,
    			maxNumPlayers: 9,
    			players: ["Bunk Bunkovich", "Aleksander irreligious86"]
    		},
    		{
    			date: getRndDate(),
    			id: 35490,
    			maxNumPlayers: 11,
    			players: [
    				"Lupusregina[beta]",
    				"Den Ri",
    				"Зомби Ich bin Roboter",
    				"Bunk Bunkovich",
    				"Aleksander irreligious86",
    				"Chingiz Mam"
    			],
    			hasSelf: true
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CurrentGames> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		IconPlus: Plus,
    		IconPlus2: Plus2,
    		IconClose2: Close2,
    		formatDate,
    		getRndDate,
    		games
    	});

    	$$self.$inject_state = $$props => {
    		if ("games" in $$props) $$invalidate(1, games = $$props.games);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [formatDate, games];
    }

    class CurrentGames extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CurrentGames",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Build.svelte generated by Svelte v3.29.4 */

    const file$7 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Build.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "30" },
    		{ height: "30" },
    		{ viewBox: "0 0 30 30" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ fill: "#979797" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M15.1125 3.63744C12.6 1.12494 8.8375 0.612443 5.8125 2.08744L11.2375 7.51244L7.4875 11.2624L2.0625 5.83744C0.600004 8.87494 1.1125 12.6124 3.625 15.1249C5.95 17.4499 9.35001 18.0624 12.2375 16.9749L23.625 28.3624C24.1125 28.8499 24.9 28.8499 25.3875 28.3624L28.2625 25.4874C28.75 24.9999 28.75 24.2124 28.2625 23.7249L16.925 12.3749C18.075 9.44994 17.475 5.99994 15.1125 3.63744Z");
    			add_location(path, file$7, 1, 0, 118);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "30" },
    				{ height: "30" },
    				{ viewBox: "0 0 30 30" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ fill: "#979797" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Build", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Build extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Build",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Cached.svelte generated by Svelte v3.29.4 */

    const file$8 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Cached.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "31" },
    		{ height: "30" },
    		{ viewBox: "0 0 31 30" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M24.0834 10L19.0834 15H22.8334C22.8334 19.1375 19.4709 22.5 15.3334 22.5C14.0709 22.5 12.8709 22.1875 11.8334 21.625L10.0084 23.45C11.5459 24.425 13.3709 25 15.3334 25C20.8584 25 25.3334 20.525 25.3334 15H29.0834L24.0834 10ZM7.83337 15C7.83337 10.8625 11.1959 7.5 15.3334 7.5C16.5959 7.5 17.7959 7.8125 18.8334 8.375L20.6584 6.55C19.1209 5.575 17.2959 5 15.3334 5C9.80837 5 5.33337 9.475 5.33337 15H1.58337L6.58337 20L11.5834 15H7.83337Z");
    			attr_dev(path, "fill", "#979797");
    			add_location(path, file$8, 1, 0, 116);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "31" },
    				{ height: "30" },
    				{ viewBox: "0 0 31 30" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cached", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Cached extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cached",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Search.svelte generated by Svelte v3.29.4 */

    const file$9 = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Search.svelte";

    function create_fragment$9(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "31" },
    		{ height: "30" },
    		{ viewBox: "0 0 31 30" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M20.0416 17.5H19.0541L18.7041 17.1625C19.9291 15.7375 20.6666 13.8875 20.6666 11.875C20.6666 7.3875 17.0291 3.75 12.5416 3.75C8.05413 3.75 4.41663 7.3875 4.41663 11.875C4.41663 16.3625 8.05413 20 12.5416 20C14.5541 20 16.4041 19.2625 17.8291 18.0375L18.1666 18.3875V19.375L24.4166 25.6125L26.2791 23.75L20.0416 17.5ZM12.5416 17.5C9.42913 17.5 6.91663 14.9875 6.91663 11.875C6.91663 8.76249 9.42913 6.24999 12.5416 6.24999C15.6541 6.24999 18.1666 8.76249 18.1666 11.875C18.1666 14.9875 15.6541 17.5 12.5416 17.5Z");
    			attr_dev(path, "fill", "#979797");
    			add_location(path, file$9, 1, 0, 116);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "31" },
    				{ height: "30" },
    				{ viewBox: "0 0 31 30" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Search", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Favorite.svelte generated by Svelte v3.29.4 */

    const file$a = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Favorite.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "30" },
    		{ height: "30" },
    		{ viewBox: "0 0 30 30" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M15 26.6875L13.1875 25.0375C6.75 19.2 2.5 15.35 2.5 10.625C2.5 6.775 5.525 3.75 9.375 3.75C11.55 3.75 13.6375 4.7625 15 6.3625C16.3625 4.7625 18.45 3.75 20.625 3.75C24.475 3.75 27.5 6.775 27.5 10.625C27.5 15.35 23.25 19.2 16.8125 25.05L15 26.6875Z");
    			attr_dev(path, "fill", "#979797");
    			add_location(path, file$a, 1, 0, 116);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "30" },
    				{ height: "30" },
    				{ viewBox: "0 0 30 30" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Favorite", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Favorite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Favorite",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Settings.svelte generated by Svelte v3.29.4 */

    const file$b = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Settings.svelte";

    function create_fragment$b(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "31" },
    		{ height: "30" },
    		{ viewBox: "0 0 31 30" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M24.2373 16.17C24.2823 15.795 24.3123 15.405 24.3123 15C24.3123 14.595 24.2823 14.205 24.2223 13.83L26.7573 11.85C26.9823 11.67 27.0423 11.34 26.9073 11.085L24.5073 6.93C24.3573 6.66 24.0423 6.57 23.7723 6.66L20.7873 7.86C20.1573 7.38 19.4973 6.99 18.7623 6.69L18.3123 3.51C18.2673 3.21 18.0123 3 17.7123 3H12.9123C12.6123 3 12.3723 3.21 12.3273 3.51L11.8773 6.69C11.1423 6.99 10.4673 7.395 9.85227 7.86L6.86727 6.66C6.59727 6.555 6.28227 6.66 6.13227 6.93L3.73227 11.085C3.58227 11.355 3.64227 11.67 3.88227 11.85L6.41727 13.83C6.35727 14.205 6.31227 14.61 6.31227 15C6.31227 15.39 6.34227 15.795 6.40227 16.17L3.86727 18.15C3.64227 18.33 3.58227 18.66 3.71727 18.915L6.11727 23.07C6.26727 23.34 6.58227 23.43 6.85227 23.34L9.83727 22.14C10.4673 22.62 11.1273 23.01 11.8623 23.31L12.3123 26.49C12.3723 26.79 12.6123 27 12.9123 27H17.7123C18.0123 27 18.2673 26.79 18.2973 26.49L18.7473 23.31C19.4823 23.01 20.1573 22.605 20.7723 22.14L23.7573 23.34C24.0273 23.445 24.3423 23.34 24.4923 23.07L26.8923 18.915C27.0423 18.645 26.9823 18.33 26.7423 18.15L24.2373 16.17ZM15.3123 19.5C12.8373 19.5 10.8123 17.475 10.8123 15C10.8123 12.525 12.8373 10.5 15.3123 10.5C17.7873 10.5 19.8123 12.525 19.8123 15C19.8123 17.475 17.7873 19.5 15.3123 19.5Z");
    			attr_dev(path, "fill", "#979797");
    			add_location(path, file$b, 1, 0, 117);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "31" },
    				{ height: "30" },
    				{ viewBox: "0 0 31 30" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Visibility.svelte generated by Svelte v3.29.4 */

    const file$c = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Visibility.svelte";

    function create_fragment$c(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "31" },
    		{ height: "30" },
    		{ viewBox: "0 0 31 30" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M15.6666 6.25C9.41663 6.25 4.07913 10.1375 1.91663 15.625C4.07913 21.1125 9.41663 25 15.6666 25C21.9166 25 27.2541 21.1125 29.4166 15.625C27.2541 10.1375 21.9166 6.25 15.6666 6.25ZM15.6666 21.875C12.2166 21.875 9.41663 19.075 9.41663 15.625C9.41663 12.175 12.2166 9.37501 15.6666 9.37501C19.1166 9.37501 21.9166 12.175 21.9166 15.625C21.9166 19.075 19.1166 21.875 15.6666 21.875ZM15.6666 11.875C13.5916 11.875 11.9166 13.55 11.9166 15.625C11.9166 17.7 13.5916 19.375 15.6666 19.375C17.7416 19.375 19.4166 17.7 19.4166 15.625C19.4166 13.55 17.7416 11.875 15.6666 11.875Z");
    			attr_dev(path, "fill", "#979797");
    			add_location(path, file$c, 1, 0, 117);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "31" },
    				{ height: "30" },
    				{ viewBox: "0 0 31 30" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Visibility", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Visibility extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Visibility",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\CheckCircle.svelte generated by Svelte v3.29.4 */

    const file$d = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\CheckCircle.svelte";

    function create_fragment$d(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "30" },
    		{ height: "30" },
    		{ viewBox: "0 0 30 30" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M15 2.5C8.1 2.5 2.5 8.1 2.5 15C2.5 21.9 8.1 27.5 15 27.5C21.9 27.5 27.5 21.9 27.5 15C27.5 8.1 21.9 2.5 15 2.5ZM12.5 21.25L6.25 15L8.0125 13.2375L12.5 17.7125L21.9875 8.22498L23.75 9.99998L12.5 21.25Z");
    			attr_dev(path, "fill", "#979797");
    			add_location(path, file$d, 1, 0, 117);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "30" },
    				{ height: "30" },
    				{ viewBox: "0 0 30 30" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CheckCircle", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class CheckCircle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckCircle",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\Close3.svelte generated by Svelte v3.29.4 */

    const file$e = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\Close3.svelte";

    function create_fragment$e(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "19" },
    		{ height: "17" },
    		{ viewBox: "0 0 19 17" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M18.5416 1.645L16.7204 0L9.49998 6.52167L2.27956 0L0.458313 1.645L7.67873 8.16667L0.458313 14.6883L2.27956 16.3333L9.49998 9.81167L16.7204 16.3333L18.5416 14.6883L11.3212 8.16667L18.5416 1.645Z");
    			attr_dev(path, "fill", "white");
    			attr_dev(path, "fill-opacity", "0.6");
    			add_location(path, file$e, 1, 0, 116);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "19" },
    				{ height: "17" },
    				{ viewBox: "0 0 19 17" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Close3", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class Close3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Close3",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\Chat.svelte generated by Svelte v3.29.4 */
    const file$f = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\Chat.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (18:3) {#each messages as msg }
    function create_each_block$1(ctx) {
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div1;
    	let t1_value = /*msg*/ ctx[6].author + "";
    	let t1;
    	let t2;
    	let div2;
    	let t3_value = /*msg*/ ctx[6].message + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			if (img.src !== (img_src_value = "assets/avatars/" + /*msg*/ ctx[6].avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-19mu4db");
    			add_location(img, file$f, 20, 6, 485);
    			attr_dev(div0, "class", "chatMessageAvatar svelte-19mu4db");
    			add_location(div0, file$f, 19, 5, 445);
    			attr_dev(div1, "class", "chatMessageContentAuthor svelte-19mu4db");
    			add_location(div1, file$f, 23, 6, 589);
    			attr_dev(div2, "class", "chatMessageContentData svelte-19mu4db");
    			add_location(div2, file$f, 24, 6, 656);
    			attr_dev(div3, "class", "chatMessageContent svelte-19mu4db");
    			add_location(div3, file$f, 22, 5, 548);
    			attr_dev(div4, "class", "chatMessage svelte-19mu4db");
    			add_location(div4, file$f, 18, 4, 412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div4, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 1 && img.src !== (img_src_value = "assets/avatars/" + /*msg*/ ctx[6].avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*messages*/ 1 && t1_value !== (t1_value = /*msg*/ ctx[6].author + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*messages*/ 1 && t3_value !== (t3_value = /*msg*/ ctx[6].message + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(18:3) {#each messages as msg }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div12;
    	let div1;
    	let div0;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div6;
    	let div5;
    	let t5;
    	let div7;
    	let t6;
    	let div11;
    	let div9;
    	let input;
    	let t7;
    	let div8;
    	let close3;
    	let t8;
    	let div10;
    	let iconbuild;
    	let t9;
    	let iconcached;
    	let t10;
    	let iconsearch;
    	let t11;
    	let iconfavorite;
    	let t12;
    	let iconsettings;
    	let t13;
    	let iconvisibility;
    	let t14;
    	let iconcheckcircle;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*messages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	close3 = new Close3({
    			props: { style: "width: 18rem; height: 16rem;" },
    			$$inline: true
    		});

    	iconbuild = new Build({
    			props: { style: "width: 30rem; height: 30rem;" },
    			$$inline: true
    		});

    	iconcached = new Cached({
    			props: { style: "width: 30rem; height: 30rem;" },
    			$$inline: true
    		});

    	iconsearch = new Search({
    			props: { style: "width: 30rem; height: 30rem;" },
    			$$inline: true
    		});

    	iconfavorite = new Favorite({
    			props: { style: "width: 30rem; height: 30rem;" },
    			$$inline: true
    		});

    	iconsettings = new Settings({
    			props: { style: "width: 30rem; height: 30rem;" },
    			$$inline: true
    		});

    	iconvisibility = new Visibility({
    			props: { style: "width: 30rem; height: 30rem;" },
    			$$inline: true
    		});

    	iconcheckcircle = new CheckCircle({
    			props: { style: "width: 30rem; height: 30rem;" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Игроки онлайн";
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div7 = element("div");
    			t6 = space();
    			div11 = element("div");
    			div9 = element("div");
    			input = element("input");
    			t7 = space();
    			div8 = element("div");
    			create_component(close3.$$.fragment);
    			t8 = space();
    			div10 = element("div");
    			create_component(iconbuild.$$.fragment);
    			t9 = space();
    			create_component(iconcached.$$.fragment);
    			t10 = space();
    			create_component(iconsearch.$$.fragment);
    			t11 = space();
    			create_component(iconfavorite.$$.fragment);
    			t12 = space();
    			create_component(iconsettings.$$.fragment);
    			t13 = space();
    			create_component(iconvisibility.$$.fragment);
    			t14 = space();
    			create_component(iconcheckcircle.$$.fragment);
    			attr_dev(div0, "class", "currentGamesLabel svelte-19mu4db");
    			add_location(div0, file$f, 2, 2, 52);
    			attr_dev(div1, "class", "header svelte-19mu4db");
    			add_location(div1, file$f, 1, 1, 27);
    			set_style(div2, "height", "17rem");
    			add_location(div2, file$f, 4, 1, 115);
    			set_style(div3, "background", "#FFFFFF");
    			set_style(div3, "mix-blend-mode", "normal");
    			set_style(div3, "opacity", "0.12");
    			set_style(div3, "width", "100%");
    			set_style(div3, "height", "1px");
    			add_location(div3, file$f, 5, 1, 153);
    			set_style(div4, "height", "31rem");
    			add_location(div4, file$f, 13, 1, 283);
    			attr_dev(div5, "class", "chatMessageList svelte-19mu4db");
    			add_location(div5, file$f, 16, 2, 347);
    			attr_dev(div6, "class", "chat svelte-19mu4db");
    			add_location(div6, file$f, 15, 1, 324);
    			set_style(div7, "height", "40rem");
    			add_location(div7, file$f, 31, 1, 777);
    			attr_dev(input, "placeholder", "Введите сообщение");
    			attr_dev(input, "class", "svelte-19mu4db");
    			add_location(input, file$f, 35, 3, 887);
    			attr_dev(div8, "class", "inputMessageClear svelte-19mu4db");
    			toggle_class(div8, "inputMessageClearShow", /*inputMessage*/ ctx[1].length);
    			add_location(div8, file$f, 36, 3, 1004);
    			attr_dev(div9, "class", "containerInput svelte-19mu4db");
    			add_location(div9, file$f, 34, 2, 853);
    			attr_dev(div10, "class", "containerControlList svelte-19mu4db");
    			add_location(div10, file$f, 41, 2, 1205);
    			attr_dev(div11, "class", "containerControl svelte-19mu4db");
    			add_location(div11, file$f, 33, 1, 818);
    			attr_dev(div12, "class", "container svelte-19mu4db");
    			add_location(div12, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div1);
    			append_dev(div1, div0);
    			append_dev(div12, t1);
    			append_dev(div12, div2);
    			append_dev(div12, t2);
    			append_dev(div12, div3);
    			append_dev(div12, t3);
    			append_dev(div12, div4);
    			append_dev(div12, t4);
    			append_dev(div12, div6);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			append_dev(div12, t5);
    			append_dev(div12, div7);
    			append_dev(div12, t6);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, input);
    			set_input_value(input, /*inputMessage*/ ctx[1]);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			mount_component(close3, div8, null);
    			append_dev(div11, t8);
    			append_dev(div11, div10);
    			mount_component(iconbuild, div10, null);
    			append_dev(div10, t9);
    			mount_component(iconcached, div10, null);
    			append_dev(div10, t10);
    			mount_component(iconsearch, div10, null);
    			append_dev(div10, t11);
    			mount_component(iconfavorite, div10, null);
    			append_dev(div10, t12);
    			mount_component(iconsettings, div10, null);
    			append_dev(div10, t13);
    			mount_component(iconvisibility, div10, null);
    			append_dev(div10, t14);
    			mount_component(iconcheckcircle, div10, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[4], false, false, false),
    					listen_dev(div8, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*messages*/ 1) {
    				each_value = /*messages*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*inputMessage*/ 2 && input.value !== /*inputMessage*/ ctx[1]) {
    				set_input_value(input, /*inputMessage*/ ctx[1]);
    			}

    			if (dirty & /*inputMessage*/ 2) {
    				toggle_class(div8, "inputMessageClearShow", /*inputMessage*/ ctx[1].length);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(close3.$$.fragment, local);
    			transition_in(iconbuild.$$.fragment, local);
    			transition_in(iconcached.$$.fragment, local);
    			transition_in(iconsearch.$$.fragment, local);
    			transition_in(iconfavorite.$$.fragment, local);
    			transition_in(iconsettings.$$.fragment, local);
    			transition_in(iconvisibility.$$.fragment, local);
    			transition_in(iconcheckcircle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(close3.$$.fragment, local);
    			transition_out(iconbuild.$$.fragment, local);
    			transition_out(iconcached.$$.fragment, local);
    			transition_out(iconsearch.$$.fragment, local);
    			transition_out(iconfavorite.$$.fragment, local);
    			transition_out(iconsettings.$$.fragment, local);
    			transition_out(iconvisibility.$$.fragment, local);
    			transition_out(iconcheckcircle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			destroy_each(each_blocks, detaching);
    			destroy_component(close3);
    			destroy_component(iconbuild);
    			destroy_component(iconcached);
    			destroy_component(iconsearch);
    			destroy_component(iconfavorite);
    			destroy_component(iconsettings);
    			destroy_component(iconvisibility);
    			destroy_component(iconcheckcircle);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Chat", slots, []);

    	let messages = [
    		{
    			avatar: "1.png",
    			author: "Зомби Ich bin Roboter",
    			message: "Q. What did the guy say to the horse when he walked into the bar? A. Why the long face??"
    		},
    		{
    			avatar: "2.png",
    			author: "Aleksander irreligious86",
    			message: "What happens when you cross a singer and a rocking chair? — you rock to the beat."
    		},
    		{
    			avatar: "3.png",
    			author: "Bunk Bunkovich",
    			message: "What do you call a lease of false teeth? — a dental rental"
    		},
    		{
    			avatar: "3.png",
    			author: "Bunk Bunkovich",
    			message: "What do you call a lease of false teeth? — a dental rental"
    		},
    		{
    			avatar: "3.png",
    			author: "Bunk Bunkovich",
    			message: "What do you call a lease of false teeth? — a dental rental"
    		},
    		{
    			avatar: "3.png",
    			author: "Bunk Bunkovich",
    			message: "What do you call a lease of false teeth? — a dental rental"
    		},
    		{
    			avatar: "3.png",
    			author: "Bunk Bunkovich",
    			message: "What do you call a lease of false teeth? — a dental rental"
    		}
    	];

    	let inputMessage = "";

    	function enter() {
    		if (!inputMessage) return;

    		messages.push({
    			avatar: "1.png",
    			author: "Lupusregina[beta]",
    			message: inputMessage
    		});

    		$$invalidate(0, messages);
    		$$invalidate(1, inputMessage = "");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chat> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		inputMessage = this.value;
    		$$invalidate(1, inputMessage);
    	}

    	const keydown_handler = e => e.which === 13 && enter();
    	const click_handler = () => $$invalidate(1, inputMessage = "");

    	$$self.$capture_state = () => ({
    		IconBuild: Build,
    		IconCached: Cached,
    		IconSearch: Search,
    		IconFavorite: Favorite,
    		IconSettings: Settings,
    		IconVisibility: Visibility,
    		IconCheckCircle: CheckCircle,
    		Close3,
    		messages,
    		inputMessage,
    		enter
    	});

    	$$self.$inject_state = $$props => {
    		if ("messages" in $$props) $$invalidate(0, messages = $$props.messages);
    		if ("inputMessage" in $$props) $$invalidate(1, inputMessage = $$props.inputMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		messages,
    		inputMessage,
    		enter,
    		input_input_handler,
    		keydown_handler,
    		click_handler
    	];
    }

    class Chat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chat",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\PlayersOnline.svelte generated by Svelte v3.29.4 */

    const file$g = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\PlayersOnline.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (17:2) {#each players as player}
    function create_each_block$2(ctx) {
    	let div;
    	let t_value = /*player*/ ctx[1].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "playerItem svelte-dm919q");
    			toggle_class(div, "playerItemActive", /*player*/ ctx[1].active);
    			add_location(div, file$g, 17, 3, 383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*players*/ 1) {
    				toggle_class(div, "playerItemActive", /*player*/ ctx[1].active);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:2) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div6;
    	let div1;
    	let div0;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div5;
    	let each_value = /*players*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Игроки онлайн";
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "currentGamesLabel svelte-dm919q");
    			add_location(div0, file$g, 2, 2, 52);
    			attr_dev(div1, "class", "header svelte-dm919q");
    			add_location(div1, file$g, 1, 1, 27);
    			set_style(div2, "height", "17rem");
    			add_location(div2, file$g, 4, 1, 115);
    			set_style(div3, "background", "#FFFFFF");
    			set_style(div3, "mix-blend-mode", "normal");
    			set_style(div3, "opacity", "0.12");
    			set_style(div3, "width", "100%");
    			set_style(div3, "height", "1px");
    			add_location(div3, file$g, 5, 1, 153);
    			set_style(div4, "height", "31rem");
    			add_location(div4, file$g, 13, 1, 283);
    			attr_dev(div5, "class", "playerList svelte-dm919q");
    			add_location(div5, file$g, 15, 1, 324);
    			attr_dev(div6, "class", "container svelte-dm919q");
    			add_location(div6, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div2);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			append_dev(div6, t3);
    			append_dev(div6, div4);
    			append_dev(div6, t4);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*players*/ 1) {
    				each_value = /*players*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayersOnline", slots, []);

    	let players = [
    		"Lupusregina[beta]",
    		"Den Ri",
    		"Зомби Ich bin Roboter",
    		"Bunk Bunkovich",
    		"Bakunov",
    		"Aleksander irreligious86",
    		"Pacificescape",
    		"Peach lasagna",
    		"Chingiz Mamiyev",
    		"Ilya Kozyura",
    		"Anton Miroshnichenko",
    		"Just_Miracle",
    		"Vladislav Stepanov",
    		"Marcello Giovanni",
    		"Robert Sabirov",
    		"Сергей Очеретенко",
    		"Aleksander irreligious86",
    		"Pacificescape",
    		"Peach lasagna",
    		"Chingiz Mamiyev",
    		"Ilya Kozyura"
    	].map(n => ({ name: n, active: Math.random() < 0.3 }));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayersOnline> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ players });

    	$$self.$inject_state = $$props => {
    		if ("players" in $$props) $$invalidate(0, players = $$props.players);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [players];
    }

    class PlayersOnline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayersOnline",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\pages\Main\index.svelte generated by Svelte v3.29.4 */
    const file$h = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\pages\\Main\\index.svelte";

    function create_fragment$h(ctx) {
    	let div0;
    	let t0;
    	let div5;
    	let div4;
    	let div1;
    	let t2;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let button;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "MAFIA";
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "online";
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			button = element("button");
    			button.textContent = "ВОЙТИ";
    			attr_dev(div0, "class", "background svelte-17ve99s");
    			add_location(div0, file$h, 0, 0, 0);
    			attr_dev(div1, "class", "mafiaLabel svelte-17ve99s");
    			add_location(div1, file$h, 3, 2, 88);
    			attr_dev(div2, "class", "onlineLabel svelte-17ve99s");
    			add_location(div2, file$h, 4, 2, 128);
    			set_style(div3, "height", "139rem");
    			add_location(div3, file$h, 5, 2, 170);
    			attr_dev(button, "class", "signinBtn svelte-17ve99s");
    			add_location(button, file$h, 6, 2, 210);
    			attr_dev(div4, "class", "logoGroup svelte-17ve99s");
    			add_location(div4, file$h, 2, 1, 60);
    			attr_dev(div5, "class", "container svelte-17ve99s");
    			add_location(div5, file$h, 1, 0, 33);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div4, t5);
    			append_dev(div4, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Main", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		MainLabel,
    		CurrentGames,
    		Chat,
    		PlayersOnline
    	});

    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\ArrowLeft.svelte generated by Svelte v3.29.4 */

    const file$i = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\ArrowLeft.svelte";

    function create_fragment$i(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "8" },
    		{ height: "12" },
    		{ viewBox: "0 0 8 12" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ fill: "#979797" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M7.41 1.41L6 0L0 6L6 12L7.41 10.59L2.83 6L7.41 1.41Z");
    			add_location(path, file$i, 1, 1, 119);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$i, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "8" },
    				{ height: "12" },
    				{ viewBox: "0 0 8 12" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ fill: "#979797" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArrowLeft", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class ArrowLeft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArrowLeft",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\components\icons\ArrowRight.svelte generated by Svelte v3.29.4 */

    const file$j = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\components\\icons\\ArrowRight.svelte";

    function create_fragment$j(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ width: "8" },
    		{ height: "12" },
    		{ viewBox: "0 0 8 12" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ fill: "#979797" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "clip-rule", "evenodd");
    			attr_dev(path, "d", "M1.99984 0L0.589844 1.41L5.16984 6L0.589844 10.59L1.99984 12L7.99984 6L1.99984 0Z");
    			add_location(path, file$j, 1, 1, 120);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ width: "8" },
    				{ height: "12" },
    				{ viewBox: "0 0 8 12" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ fill: "#979797" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArrowRight", slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    	};

    	return [$$restProps];
    }

    class ArrowRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArrowRight",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    let supportResizeObserver = typeof ResizeObserver !== 'undefined';

    const resizeListeners = new Set();
    window.addEventListener('resize', () => {
    	for(const cb of resizeListeners.values())
    		cb();
    });

    const useResizeObserver = (elem, callback) => {
    	const interval = 100;
    	if ( supportResizeObserver ) {
    		const resizeObserver = new ResizeObserver((a) => callback(elem.getBoundingClientRect()));
    		resizeObserver.observe(elem);
    		return { destroy: () => resizeObserver.disconnect() }
    	}
    	
    	const keys = [ "x", "y", "height", "width", ];
    	let prevBBox = {};
    	const loop = () => {
    		const nextBBox = elem.getBoundingClientRect();
    		if ( keys.some(k => prevBBox[k] !== nextBBox[k]) )
    			callback(nextBBox);
    			
    		prevBBox = nextBBox;
    	};
    	loop();

    	resizeListeners.add(loop);

    	const iiId = setInterval(loop, interval);
    	return {
    		destroy() {
    			clearInterval(iiId);
    			resizeListeners.delete(loop);
    		}
    	}
    };

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\pages\GameRules\index.svelte generated by Svelte v3.29.4 */

    const { console: console_1 } = globals;
    const file$k = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\pages\\GameRules\\index.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (11:4) {#each gameRules as gameRule, i}
    function create_each_block$3(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*gameRule*/ ctx[14].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*gameRule*/ ctx[14].description + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div0, "class", "gameRuleTitle svelte-zwn93r");
    			add_location(div0, file$k, 12, 6, 436);
    			attr_dev(div1, "class", "gameRuleDescription svelte-zwn93r");
    			add_location(div1, file$k, 13, 6, 496);
    			attr_dev(div2, "class", "gameRule");
    			add_location(div2, file$k, 11, 5, 405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div2, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:4) {#each gameRules as gameRule, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div10;
    	let div9;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3;
    	let div2;
    	let useResizeObserver_action;
    	let t3;
    	let div4;
    	let t4;
    	let div8;
    	let div7;
    	let div5;
    	let arrowleft;
    	let t5;
    	let div6;
    	let arrowright;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*gameRules*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	arrowleft = new ArrowLeft({
    			props: {
    				style: "width: 7px; height: 12px;",
    				fill: /*canGoLeft*/ ctx[4] ? "#FFF" : "#979797"
    			},
    			$$inline: true
    		});

    	arrowright = new ArrowRight({
    			props: {
    				style: "width: 7px; height: 12px;",
    				fill: /*canGoRight*/ ctx[3] ? "#FFF" : "#979797"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div9 = element("div");
    			div0 = element("div");
    			div0.textContent = "Правила";
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			create_component(arrowleft.$$.fragment);
    			t5 = space();
    			div6 = element("div");
    			create_component(arrowright.$$.fragment);
    			attr_dev(div0, "class", "gameRuleLabel svelte-zwn93r");
    			add_location(div0, file$k, 2, 2, 47);
    			set_style(div1, "height", "64rem");
    			add_location(div1, file$k, 6, 2, 104);
    			attr_dev(div2, "class", "gameRulesWrapper svelte-zwn93r");
    			set_style(div2, "transform", "translate3d(0px, " + /*gameRulesWrapperY*/ ctx[0] + "px, 0)");
    			add_location(div2, file$k, 9, 3, 233);
    			attr_dev(div3, "class", "gameRules svelte-zwn93r");
    			add_location(div3, file$k, 8, 2, 147);
    			set_style(div4, "height", "40rem");
    			add_location(div4, file$k, 19, 2, 615);
    			attr_dev(div5, "class", "arrowBtn svelte-zwn93r");
    			add_location(div5, file$k, 23, 4, 722);
    			attr_dev(div6, "class", "arrowBtn svelte-zwn93r");
    			add_location(div6, file$k, 24, 4, 864);
    			attr_dev(div7, "class", "control svelte-zwn93r");
    			add_location(div7, file$k, 22, 3, 694);
    			attr_dev(div8, "class", "containerControl svelte-zwn93r");
    			add_location(div8, file$k, 21, 2, 658);
    			attr_dev(div9, "class", "content svelte-zwn93r");
    			add_location(div9, file$k, 1, 1, 21);
    			attr_dev(div10, "class", "body svelte-zwn93r");
    			add_location(div10, file$k, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div9);
    			append_dev(div9, div0);
    			append_dev(div9, t1);
    			append_dev(div9, div1);
    			append_dev(div9, t2);
    			append_dev(div9, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			/*div2_binding*/ ctx[8](div2);
    			/*div3_binding*/ ctx[9](div3);
    			append_dev(div9, t3);
    			append_dev(div9, div4);
    			append_dev(div9, t4);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			mount_component(arrowleft, div5, null);
    			append_dev(div7, t5);
    			append_dev(div7, div6);
    			mount_component(arrowright, div6, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useResizeObserver_action = useResizeObserver.call(null, div3, /*resize*/ ctx[5])),
    					listen_dev(div5, "click", /*go*/ ctx[6](-1), false, false, false),
    					listen_dev(div6, "click", /*go*/ ctx[6](+1), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gameRules*/ 128) {
    				each_value = /*gameRules*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*gameRulesWrapperY*/ 1) {
    				set_style(div2, "transform", "translate3d(0px, " + /*gameRulesWrapperY*/ ctx[0] + "px, 0)");
    			}

    			const arrowleft_changes = {};
    			if (dirty & /*canGoLeft*/ 16) arrowleft_changes.fill = /*canGoLeft*/ ctx[4] ? "#FFF" : "#979797";
    			arrowleft.$set(arrowleft_changes);
    			const arrowright_changes = {};
    			if (dirty & /*canGoRight*/ 8) arrowright_changes.fill = /*canGoRight*/ ctx[3] ? "#FFF" : "#979797";
    			arrowright.$set(arrowright_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrowleft.$$.fragment, local);
    			transition_in(arrowright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrowleft.$$.fragment, local);
    			transition_out(arrowright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[8](null);
    			/*div3_binding*/ ctx[9](null);
    			destroy_component(arrowleft);
    			destroy_component(arrowright);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GameRules", slots, []);
    	let gameRulesWrapperY = 0;
    	let elGameRules, elGameRulesWrapper;
    	let maxHeight = 0;
    	let gameRuleItemList = [];
    	let gameRuleIndexStart = 0;

    	function update() {
    		const { y: yc, height: hc } = elGameRules.getBoundingClientRect();
    		const elGameRuleList = [...elGameRulesWrapper.querySelectorAll(".gameRule")];
    		if (elGameRuleList.length !== gameRules.length) return tick().then(update);

    		gameRuleItemList = gameRules.map((v, i) => {
    			const { y, height } = elGameRuleList[i].getBoundingClientRect();

    			return gameRuleItemList[i] = {
    				y: y - gameRulesWrapperY - yc,
    				height,
    				el: elGameRuleList[i]
    			};
    		});

    		$$invalidate(12, gameRuleIndexStart = Math.max(0, Math.min(gameRuleItemList.length - 1, gameRuleIndexStart)));
    		$$invalidate(0, gameRulesWrapperY = -gameRuleItemList[gameRuleIndexStart].y);
    		$$invalidate(10, maxHeight = 0);

    		gameRuleItemList.map(gri => {
    			gri.el.style.visibility = "";
    			const y = gri.y + gameRulesWrapperY;

    			if (y < 0) {
    				gri.el.style.visibility = "hidden";
    			} else if (y + gri.height > hc) {
    				gri.el.style.visibility = "hidden";
    			} else {
    				$$invalidate(10, maxHeight++, maxHeight);
    			}
    		});

    		console.log(gameRuleItemList, maxHeight);
    	}

    	function resize() {
    		update();
    	}

    	const go = dir => e => {
    		const { height } = elGameRules.getBoundingClientRect();
    		const a = gameRuleItemList.slice(0, gameRuleIndexStart).reverse();
    		let i = 0, sh = 0;
    		for (; i < a.length && sh < height; i++) sh += a[i].height;
    		if (dir > 0 && canGoRight) $$invalidate(12, gameRuleIndexStart += maxHeight); else if (dir < 0 && canGoLeft) $$invalidate(12, gameRuleIndexStart -= i);
    		tick().then(update);
    	};

    	const gameRules = [
    		{
    			title: "Как общаться с другими игроками?",
    			description: "Если нажать на чей-то ник, то можно написать сообщение, адресованное именно ему, но доступное для чтения всем остальным присутствующим на улице. Если нажать на конверт, то сообщение будет приватным и окажется видным только Вам и адресату."
    		},
    		{
    			title: "Как начать игру?",
    			description: "На главной странице можно создать партию самому, нажав кнопку «Создать». Либо же присоединиться к уже созданной заявке, нажав на красный крест справа от заявки. Игра начинается с того момента, когда наберётся указанное максимальное количество игроков, либо же истечёт время ожидания, а игроков в заявке будет 7 или более."
    		},
    		{
    			title: "Какие роли есть в игре?",
    			description: "После начала партии случайным образом происходит распределение ролей. Выбор ролей ограничивается тремя: комиссар, мафия и честный человек."
    		},
    		{
    			title: "Как проходит игра?",
    			description: `
Первые две минуты игры уходят на то, чтоб мафия могла обсудить план действий. Далее игра приобретает циклический характер:
День:
   — Голосование, выбор посадки (днём честные жители, во время обсуждения, пытаются вычислить, кто в игре — мафия, и путём голосования выбирают, кого посадить в тюрьму)
Ночь:
   — Ход комиссара (комиссар может проверить любого игрока и узнать его настоящую роль, а ночью мафия убивает честных жителей)
   — Ход мафии (чтобы убить честного жителя, мафия должна консолидированно проголосовать за одного и того же игрока)
Игра продолжается до тех пор, пока в городе не останутся только честные жители или мафиози.`
    		},
    		{
    			title: "Комиссар (ком, шериф)",
    			description: "Комиссар в свой ход может узнать роль любого другого игрока. А затем известить о своей проверке всех остальных. Если комиссар оказывается под угрозой посадки, то он должен огласить свою роль. Комиссар играет за честных жителей."
    		},
    		{
    			title: "Честный человек (чиж, мир)",
    			description: "Знает только свою роль. Должен помнить, что в игре есть комиссар, словам которого можно доверять."
    		},
    		{
    			title: "Мафия",
    			description: "Мафия видит свою роль и роль напарника. В первые две минуты у них есть возможность обсудить план на игру с помощью приватных сообщений. Ночью для убийства необходимо, чтоб каждый мафиози выбрал одну и ту же жертву."
    		},
    		{
    			title: "Задача в игре",
    			description: `Для мафии — убить всех честных жителей, для честных жителей — посадить всю мафию в тюрьму. Игра продолжается до тех пор, пока в городе не останутся только честные жители или мафиози.
Это очень краткие правила игры в мафию, но их вполне хватит для понимания процесса игры.`
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<GameRules> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			elGameRulesWrapper = $$value;
    			$$invalidate(2, elGameRulesWrapper);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			elGameRules = $$value;
    			$$invalidate(1, elGameRules);
    		});
    	}

    	$$self.$capture_state = () => ({
    		tick,
    		ArrowLeft,
    		ArrowRight,
    		useResizeObserver,
    		gameRulesWrapperY,
    		elGameRules,
    		elGameRulesWrapper,
    		maxHeight,
    		gameRuleItemList,
    		gameRuleIndexStart,
    		update,
    		resize,
    		go,
    		gameRules,
    		canGoRight,
    		canGoLeft
    	});

    	$$self.$inject_state = $$props => {
    		if ("gameRulesWrapperY" in $$props) $$invalidate(0, gameRulesWrapperY = $$props.gameRulesWrapperY);
    		if ("elGameRules" in $$props) $$invalidate(1, elGameRules = $$props.elGameRules);
    		if ("elGameRulesWrapper" in $$props) $$invalidate(2, elGameRulesWrapper = $$props.elGameRulesWrapper);
    		if ("maxHeight" in $$props) $$invalidate(10, maxHeight = $$props.maxHeight);
    		if ("gameRuleItemList" in $$props) gameRuleItemList = $$props.gameRuleItemList;
    		if ("gameRuleIndexStart" in $$props) $$invalidate(12, gameRuleIndexStart = $$props.gameRuleIndexStart);
    		if ("canGoRight" in $$props) $$invalidate(3, canGoRight = $$props.canGoRight);
    		if ("canGoLeft" in $$props) $$invalidate(4, canGoLeft = $$props.canGoLeft);
    	};

    	let canGoLeft;
    	let canGoRight;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*gameRuleIndexStart*/ 4096) {
    			 $$invalidate(4, canGoLeft = gameRuleIndexStart > 0);
    		}

    		if ($$self.$$.dirty & /*gameRuleIndexStart, maxHeight*/ 5120) {
    			 $$invalidate(3, canGoRight = gameRuleIndexStart + maxHeight < gameRules.length);
    		}
    	};

    	return [
    		gameRulesWrapperY,
    		elGameRules,
    		elGameRulesWrapper,
    		canGoRight,
    		canGoLeft,
    		resize,
    		go,
    		gameRules,
    		div2_binding,
    		div3_binding
    	];
    }

    class GameRules extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameRules",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\pages\CurrentGames\index.svelte generated by Svelte v3.29.4 */
    const file$l = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\pages\\CurrentGames\\index.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (32:6) {:else}
    function create_else_block$1(ctx) {
    	let iconplus2;
    	let current;

    	iconplus2 = new Plus2({
    			props: { style: "width: 23rem; height: 23rem;" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(iconplus2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconplus2, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconplus2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconplus2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconplus2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(32:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:6) {#if game.hasSelf }
    function create_if_block$1(ctx) {
    	let iconclose2;
    	let current;

    	iconclose2 = new Close2({
    			props: { style: "width: 35rem; height: 35rem;" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(iconclose2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconclose2, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconclose2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconclose2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconclose2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:6) {#if game.hasSelf }",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#each games as game}
    function create_each_block$4(ctx) {
    	let div11;
    	let div6;
    	let div3;
    	let div0;
    	let t0_value = /*formatDate*/ ctx[0](/*game*/ ctx[3].date) + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3_value = /*game*/ ctx[3].id + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5;
    	let t6_value = /*game*/ ctx[3].maxNumPlayers + "";
    	let t6;
    	let t7;
    	let div5;
    	let t8;
    	let t9_value = /*game*/ ctx[3].maxNumPlayers - /*game*/ ctx[3].players.length + "";
    	let t9;
    	let t10;
    	let div4;
    	let t11;
    	let current_block_type_index;
    	let if_block;
    	let t12;
    	let div9;
    	let div7;
    	let t13;
    	let div8;
    	let t14;
    	let div10;
    	let t15_value = /*game*/ ctx[3].players.join(", ") + "";
    	let t15;
    	let t16;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*game*/ ctx[3].hasSelf) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div6 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text("№");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = text("Макс. игроков: ");
    			t6 = text(t6_value);
    			t7 = space();
    			div5 = element("div");
    			t8 = text("Ожидает ");
    			t9 = text(t9_value);
    			t10 = text(" участников\r\n\t\t\t\t\t\t");
    			div4 = element("div");
    			t11 = space();
    			if_block.c();
    			t12 = space();
    			div9 = element("div");
    			div7 = element("div");
    			t13 = space();
    			div8 = element("div");
    			t14 = space();
    			div10 = element("div");
    			t15 = text(t15_value);
    			t16 = space();
    			add_location(div0, file$l, 21, 6, 580);
    			add_location(div1, file$l, 22, 6, 624);
    			add_location(div2, file$l, 23, 6, 655);
    			attr_dev(div3, "class", "gameItemInfoLabel svelte-97b8u7");
    			add_location(div3, file$l, 20, 5, 540);
    			set_style(div4, "width", "23rem");
    			add_location(div4, file$l, 28, 6, 842);
    			attr_dev(div5, "class", "gameItemInfoAction svelte-97b8u7");
    			add_location(div5, file$l, 26, 5, 730);
    			attr_dev(div6, "class", "gameItemInfo svelte-97b8u7");
    			add_location(div6, file$l, 19, 4, 506);
    			attr_dev(div7, "class", "gameItemProgressTrack svelte-97b8u7");
    			add_location(div7, file$l, 38, 5, 1125);
    			attr_dev(div8, "class", "gameItemProgressThumb svelte-97b8u7");
    			set_style(div8, "width", /*game*/ ctx[3].players.length / /*game*/ ctx[3].maxNumPlayers * 100 + "%");
    			add_location(div8, file$l, 39, 5, 1173);
    			attr_dev(div9, "class", "gameItemProgress svelte-97b8u7");
    			add_location(div9, file$l, 37, 4, 1087);
    			attr_dev(div10, "class", "gameItemPlayers svelte-97b8u7");
    			add_location(div10, file$l, 45, 4, 1330);
    			attr_dev(div11, "class", "gameItem svelte-97b8u7");
    			add_location(div11, file$l, 18, 3, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div6);
    			append_dev(div6, div3);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, t5);
    			append_dev(div2, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, t8);
    			append_dev(div5, t9);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div5, t11);
    			if_blocks[current_block_type_index].m(div5, null);
    			append_dev(div11, t12);
    			append_dev(div11, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div11, t14);
    			append_dev(div11, div10);
    			append_dev(div10, t15);
    			append_dev(div11, t16);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(18:2) {#each games as game}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div6;
    	let div1;
    	let div0;
    	let t1;
    	let button;
    	let iconplus;
    	let t2;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let div4;
    	let t6;
    	let div5;
    	let current;

    	iconplus = new Plus({
    			props: { style: "width: 14px; height: 14px;" },
    			$$inline: true
    		});

    	let each_value = /*games*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Текущие игры";
    			t1 = space();
    			button = element("button");
    			create_component(iconplus.$$.fragment);
    			t2 = text("создать");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "currentGamesLabel svelte-97b8u7");
    			add_location(div0, file$l, 2, 2, 52);
    			attr_dev(button, "class", "createGameButton svelte-97b8u7");
    			add_location(button, file$l, 3, 2, 106);
    			attr_dev(div1, "class", "header svelte-97b8u7");
    			add_location(div1, file$l, 1, 1, 27);
    			set_style(div2, "height", "17rem");
    			add_location(div2, file$l, 5, 1, 215);
    			set_style(div3, "background", "#FFFFFF");
    			set_style(div3, "mix-blend-mode", "normal");
    			set_style(div3, "opacity", "0.12");
    			set_style(div3, "width", "100%");
    			set_style(div3, "height", "1px");
    			add_location(div3, file$l, 6, 1, 253);
    			set_style(div4, "height", "31rem");
    			add_location(div4, file$l, 14, 1, 383);
    			attr_dev(div5, "class", "gameList svelte-97b8u7");
    			add_location(div5, file$l, 16, 1, 424);
    			attr_dev(div6, "class", "container svelte-97b8u7");
    			add_location(div6, file$l, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			mount_component(iconplus, button, null);
    			append_dev(button, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div2);
    			append_dev(div6, t4);
    			append_dev(div6, div3);
    			append_dev(div6, t5);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*games, formatDate*/ 3) {
    				each_value = /*games*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div5, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconplus.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconplus.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(iconplus);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CurrentGames", slots, []);

    	const formatDate = date => {
    		const d = new Date(date);
    		const ps = n => (n + "").padStart(2, 0);
    		return [d.getDay() + 1, d.getMonth(), ps(d.getFullYear() % 2000)].map(ps).join(".") + " " + [d.getHours(), d.getMinutes(), d.getSeconds()].map(ps).join(":");
    	};

    	const getRndDate = () => Date.now() - (1000000 * Math.random() | 0);

    	let games = [
    		{
    			date: getRndDate(),
    			id: 35487,
    			maxNumPlayers: 11,
    			players: [
    				"Lupusregina[beta]",
    				"Den Ri",
    				"Зомби Ich bin Roboter",
    				"Bunk Bunkovich",
    				"Aleksander irreligious86",
    				"Chingiz Mam"
    			]
    		},
    		{
    			date: getRndDate(),
    			id: 35488,
    			maxNumPlayers: 11,
    			players: ["Зомби Ich bin Roboter"]
    		},
    		{
    			date: getRndDate(),
    			id: 35489,
    			maxNumPlayers: 9,
    			players: ["Bunk Bunkovich", "Aleksander irreligious86"]
    		},
    		{
    			date: getRndDate(),
    			id: 35490,
    			maxNumPlayers: 11,
    			players: [
    				"Lupusregina[beta]",
    				"Den Ri",
    				"Зомби Ich bin Roboter",
    				"Bunk Bunkovich",
    				"Aleksander irreligious86",
    				"Chingiz Mam"
    			],
    			hasSelf: true
    		}
    	];

    	for (let i = 0; i < 10; i++) games.push(games[Math.random() * games.length | 0]);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CurrentGames> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		IconPlus: Plus,
    		IconPlus2: Plus2,
    		IconClose2: Close2,
    		formatDate,
    		getRndDate,
    		games
    	});

    	$$self.$inject_state = $$props => {
    		if ("games" in $$props) $$invalidate(1, games = $$props.games);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [formatDate, games];
    }

    class CurrentGames$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CurrentGames",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\pages\Game\index.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$m = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\pages\\Game\\index.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    // (7:1) {#if current.state === 'init' }
    function create_if_block_19(ctx) {
    	let div0;
    	let t1;
    	let div8;
    	let div1;
    	let t3;
    	let div7;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t11;
    	let div6;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Ожидается начало игры";
    			t1 = space();
    			div8 = element("div");
    			div1 = element("div");
    			div1.textContent = "Список игроков:";
    			t3 = space();
    			div7 = element("div");
    			div2 = element("div");
    			div2.textContent = "Lupusregina[beta]";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "pacificescape";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "Alex Kovalev";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "bakunov";
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "Den ri";
    			attr_dev(div0, "class", "svelte-1xwg1c8");
    			add_location(div0, file$m, 7, 1, 255);
    			attr_dev(div1, "class", "svelte-1xwg1c8");
    			add_location(div1, file$m, 9, 2, 299);
    			attr_dev(div2, "class", "svelte-1xwg1c8");
    			add_location(div2, file$m, 11, 3, 359);
    			attr_dev(div3, "class", "svelte-1xwg1c8");
    			add_location(div3, file$m, 12, 3, 392);
    			attr_dev(div4, "class", "svelte-1xwg1c8");
    			add_location(div4, file$m, 13, 3, 421);
    			attr_dev(div5, "class", "svelte-1xwg1c8");
    			add_location(div5, file$m, 14, 3, 449);
    			attr_dev(div6, "class", "svelte-1xwg1c8");
    			add_location(div6, file$m, 15, 3, 472);
    			attr_dev(div7, "class", "playerList svelte-1xwg1c8");
    			add_location(div7, file$m, 10, 2, 329);
    			attr_dev(div8, "class", "svelte-1xwg1c8");
    			add_location(div8, file$m, 8, 1, 290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div1);
    			append_dev(div8, t3);
    			append_dev(div8, div7);
    			append_dev(div7, div2);
    			append_dev(div7, t5);
    			append_dev(div7, div3);
    			append_dev(div7, t7);
    			append_dev(div7, div4);
    			append_dev(div7, t9);
    			append_dev(div7, div5);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(7:1) {#if current.state === 'init' }",
    		ctx
    	});

    	return block;
    }

    // (23:1) {#if current.state === 'day_to_night' }
    function create_if_block_18(ctx) {
    	let video;
    	let video_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			if (video.src !== (video_src_value = "assets/witch.mp4")) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "class", "svelte-1xwg1c8");
    			add_location(video, file$m, 23, 2, 616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			/*video_binding*/ ctx[16](video);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding*/ ctx[16](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(23:1) {#if current.state === 'day_to_night' }",
    		ctx
    	});

    	return block;
    }

    // (27:1) {#if current.state === 'night_to_day' }
    function create_if_block_17(ctx) {
    	let video;
    	let video_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			if (video.src !== (video_src_value = "assets/sunrise.mp4")) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "class", "svelte-1xwg1c8");
    			add_location(video, file$m, 27, 2, 732);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			/*video_binding_1*/ ctx[17](video);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding_1*/ ctx[17](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(27:1) {#if current.state === 'night_to_day' }",
    		ctx
    	});

    	return block;
    }

    // (32:1) {#if current.state === 'day_vote' }
    function create_if_block_16(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let each_value_2 = /*players*/ ctx[6];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Кого будем вешать:";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "svelte-1xwg1c8");
    			add_location(div0, file$m, 33, 2, 857);
    			attr_dev(div1, "class", "playerList svelte-1xwg1c8");
    			add_location(div1, file$m, 34, 2, 890);
    			attr_dev(div2, "class", "svelte-1xwg1c8");
    			add_location(div2, file$m, 32, 1, 848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*players, clickPlayer*/ 4160) {
    				each_value_2 = /*players*/ ctx[6];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(32:1) {#if current.state === 'day_vote' }",
    		ctx
    	});

    	return block;
    }

    // (36:3) {#each players as player}
    function create_each_block_2(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1_value = /*player*/ ctx[30].voteHangedPlayers.size + "";
    	let t1;
    	let t2;
    	let div5;
    	let div3;
    	let t3_value = /*player*/ ctx[30].name + "";
    	let t3;
    	let t4;
    	let div4;
    	let t5;
    	let t6_value = /*player*/ ctx[30].id + "";
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			t5 = text("Player ");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(div0, "class", "avatar svelte-1xwg1c8");
    			add_location(div0, file$m, 38, 6, 1076);
    			attr_dev(div1, "class", "showVote svelte-1xwg1c8");
    			add_location(div1, file$m, 39, 6, 1111);
    			attr_dev(div2, "class", "containerAvatar svelte-1xwg1c8");
    			add_location(div2, file$m, 37, 5, 1038);
    			attr_dev(div3, "class", "playerName svelte-1xwg1c8");
    			add_location(div3, file$m, 42, 6, 1206);
    			attr_dev(div4, "class", "playerId svelte-1xwg1c8");
    			add_location(div4, file$m, 43, 6, 1260);
    			attr_dev(div5, "class", "svelte-1xwg1c8");
    			add_location(div5, file$m, 41, 5, 1193);
    			attr_dev(div6, "class", "player svelte-1xwg1c8");
    			toggle_class(div6, "dead", /*player*/ ctx[30].dead);
    			add_location(div6, file$m, 36, 4, 951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, t5);
    			append_dev(div4, t6);
    			append_dev(div6, t7);

    			if (!mounted) {
    				dispose = listen_dev(
    					div6,
    					"click",
    					function () {
    						if (is_function(/*clickPlayer*/ ctx[12](/*player*/ ctx[30]))) /*clickPlayer*/ ctx[12](/*player*/ ctx[30]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*players*/ 64 && t1_value !== (t1_value = /*player*/ ctx[30].voteHangedPlayers.size + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*players*/ 64 && t3_value !== (t3_value = /*player*/ ctx[30].name + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*players*/ 64 && t6_value !== (t6_value = /*player*/ ctx[30].id + "")) set_data_dev(t6, t6_value);

    			if (dirty[0] & /*players*/ 64) {
    				toggle_class(div6, "dead", /*player*/ ctx[30].dead);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(36:3) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    // (52:1) {#if current.state === 'day_final_vote' }
    function create_if_block_15(ctx) {
    	let div12;
    	let div0;
    	let t1;
    	let div7;
    	let div3;
    	let div1;
    	let t2;
    	let div2;
    	let t3_value = /*playerHanged*/ ctx[8].voteHangedFinalYesPlayers.size + "";
    	let t3;
    	let t4;
    	let t5_value = /*playerHanged*/ ctx[8].voteHangedFinalNoPlayers.size + "";
    	let t5;
    	let t6;
    	let div6;
    	let div4;
    	let t7_value = /*playerHanged*/ ctx[8].name + "";
    	let t7;
    	let t8;
    	let div5;
    	let t9;
    	let t10_value = /*playerHanged*/ ctx[8].id + "";
    	let t10;
    	let t11;
    	let div8;
    	let t12;
    	let div11;
    	let div9;
    	let t14;
    	let div10;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div0 = element("div");
    			div0.textContent = "Точно хотите повесить:";
    			t1 = space();
    			div7 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = text("/");
    			t5 = text(t5_value);
    			t6 = space();
    			div6 = element("div");
    			div4 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			div5 = element("div");
    			t9 = text("Player ");
    			t10 = text(t10_value);
    			t11 = space();
    			div8 = element("div");
    			t12 = space();
    			div11 = element("div");
    			div9 = element("div");
    			div9.textContent = "Yes";
    			t14 = space();
    			div10 = element("div");
    			div10.textContent = "No";
    			attr_dev(div0, "class", "svelte-1xwg1c8");
    			add_location(div0, file$m, 53, 2, 1432);
    			attr_dev(div1, "class", "avatar svelte-1xwg1c8");
    			add_location(div1, file$m, 56, 5, 1567);
    			attr_dev(div2, "class", "showVote svelte-1xwg1c8");
    			add_location(div2, file$m, 57, 5, 1601);
    			attr_dev(div3, "class", "containerAvatar svelte-1xwg1c8");
    			add_location(div3, file$m, 55, 4, 1530);
    			attr_dev(div4, "class", "playerName svelte-1xwg1c8");
    			add_location(div4, file$m, 60, 5, 1754);
    			attr_dev(div5, "class", "playerId svelte-1xwg1c8");
    			add_location(div5, file$m, 61, 5, 1813);
    			attr_dev(div6, "class", "svelte-1xwg1c8");
    			add_location(div6, file$m, 59, 4, 1742);
    			attr_dev(div7, "class", "player svelte-1xwg1c8");
    			toggle_class(div7, "dead", /*playerHanged*/ ctx[8].dead);
    			add_location(div7, file$m, 54, 3, 1470);
    			set_style(div8, "height", "10px");
    			attr_dev(div8, "class", "svelte-1xwg1c8");
    			add_location(div8, file$m, 64, 3, 1896);
    			attr_dev(div9, "class", "voteBtn svelte-1xwg1c8");
    			add_location(div9, file$m, 66, 4, 1968);
    			attr_dev(div10, "class", "voteBtn svelte-1xwg1c8");
    			add_location(div10, file$m, 67, 4, 2041);
    			attr_dev(div11, "class", "voteBtnGroup svelte-1xwg1c8");
    			add_location(div11, file$m, 65, 3, 1935);
    			attr_dev(div12, "class", "svelte-1xwg1c8");
    			add_location(div12, file$m, 52, 1, 1423);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div0);
    			append_dev(div12, t1);
    			append_dev(div12, div7);
    			append_dev(div7, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div2, t4);
    			append_dev(div2, t5);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div4, t7);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, t9);
    			append_dev(div5, t10);
    			append_dev(div12, t11);
    			append_dev(div12, div8);
    			append_dev(div12, t12);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div11, t14);
    			append_dev(div11, div10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div9, "click", /*clickPlayerFinalVote*/ ctx[15](+1), false, false, false),
    					listen_dev(div10, "click", /*clickPlayerFinalVote*/ ctx[15](-1), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*playerHanged*/ 256 && t3_value !== (t3_value = /*playerHanged*/ ctx[8].voteHangedFinalYesPlayers.size + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*playerHanged*/ 256 && t5_value !== (t5_value = /*playerHanged*/ ctx[8].voteHangedFinalNoPlayers.size + "")) set_data_dev(t5, t5_value);
    			if (dirty[0] & /*playerHanged*/ 256 && t7_value !== (t7_value = /*playerHanged*/ ctx[8].name + "")) set_data_dev(t7, t7_value);
    			if (dirty[0] & /*playerHanged*/ 256 && t10_value !== (t10_value = /*playerHanged*/ ctx[8].id + "")) set_data_dev(t10, t10_value);

    			if (dirty[0] & /*playerHanged*/ 256) {
    				toggle_class(div7, "dead", /*playerHanged*/ ctx[8].dead);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(52:1) {#if current.state === 'day_final_vote' }",
    		ctx
    	});

    	return block;
    }

    // (73:1) {#if current.state === 'day_final_vote_skip' }
    function create_if_block_14(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Жители не смогли договорится и разошлись";
    			attr_dev(div0, "class", "svelte-1xwg1c8");
    			add_location(div0, file$m, 74, 2, 2199);
    			attr_dev(div1, "class", "svelte-1xwg1c8");
    			add_location(div1, file$m, 73, 1, 2190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(73:1) {#if current.state === 'day_final_vote_skip' }",
    		ctx
    	});

    	return block;
    }

    // (79:1) {#if current.state === 'day_vote_result' }
    function create_if_block_12(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*playerHanged*/ ctx[8].dead) return create_if_block_13;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 79, 1, 2318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(79:1) {#if current.state === 'day_vote_result' }",
    		ctx
    	});

    	return block;
    }

    // (83:2) {:else}
    function create_else_block_4(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*playerHanged*/ ctx[8].name + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Игрок ");
    			t1 = text(t1_value);
    			t2 = text(" был оправдан");
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 83, 3, 2464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*playerHanged*/ 256 && t1_value !== (t1_value = /*playerHanged*/ ctx[8].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(83:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:2) {#if playerHanged.dead }
    function create_if_block_13(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*playerHanged*/ ctx[8].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*formatRole*/ ctx[10](/*playerHanged*/ ctx[8].role) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Игрок ");
    			t1 = text(t1_value);
    			t2 = text(" был повешен, он был ");
    			t3 = text(t3_value);
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 81, 3, 2356);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*playerHanged*/ 256 && t1_value !== (t1_value = /*playerHanged*/ ctx[8].name + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*playerHanged*/ 256 && t3_value !== (t3_value = /*formatRole*/ ctx[10](/*playerHanged*/ ctx[8].role) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(81:2) {#if playerHanged.dead }",
    		ctx
    	});

    	return block;
    }

    // (90:1) {#if current.state === 'night' }
    function create_if_block_6(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*selfPlayer*/ ctx[7].role === "peaceful" && create_if_block_11(ctx);
    	let if_block1 = /*selfPlayer*/ ctx[7].role === "don" && create_if_block_10(ctx);
    	let if_block2 = /*selfPlayer*/ ctx[7].role === "commissioner" && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 90, 1, 2585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*selfPlayer*/ ctx[7].role === "peaceful") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*selfPlayer*/ ctx[7].role === "don") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*selfPlayer*/ ctx[7].role === "commissioner") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(90:1) {#if current.state === 'night' }",
    		ctx
    	});

    	return block;
    }

    // (92:2) {#if selfPlayer.role === 'peaceful' }
    function create_if_block_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Вы отдыхаете и ждете дня");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(92:2) {#if selfPlayer.role === 'peaceful' }",
    		ctx
    	});

    	return block;
    }

    // (96:2) {#if selfPlayer.role === 'don' }
    function create_if_block_10(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let each_value_1 = /*players*/ ctx[6];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Кого будем убивать:";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "svelte-1xwg1c8");
    			add_location(div0, file$m, 96, 3, 2713);
    			attr_dev(div1, "class", "playerList svelte-1xwg1c8");
    			add_location(div1, file$m, 97, 3, 2748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*players, clickDonPlayer*/ 8256) {
    				each_value_1 = /*players*/ ctx[6];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(96:2) {#if selfPlayer.role === 'don' }",
    		ctx
    	});

    	return block;
    }

    // (99:4) {#each players as player}
    function create_each_block_1(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1_value = /*player*/ ctx[30].vote + "";
    	let t1;
    	let t2;
    	let div5;
    	let div3;
    	let t3_value = /*player*/ ctx[30].name + "";
    	let t3;
    	let t4;
    	let div4;
    	let t5;
    	let t6_value = /*player*/ ctx[30].id + "";
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			t5 = text("Player ");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(div0, "class", "avatar svelte-1xwg1c8");
    			add_location(div0, file$m, 101, 7, 2941);
    			attr_dev(div1, "class", "showVote svelte-1xwg1c8");
    			add_location(div1, file$m, 102, 7, 2977);
    			attr_dev(div2, "class", "containerAvatar svelte-1xwg1c8");
    			add_location(div2, file$m, 100, 6, 2902);
    			attr_dev(div3, "class", "playerName svelte-1xwg1c8");
    			add_location(div3, file$m, 105, 7, 3057);
    			attr_dev(div4, "class", "playerId svelte-1xwg1c8");
    			add_location(div4, file$m, 106, 7, 3112);
    			attr_dev(div5, "class", "svelte-1xwg1c8");
    			add_location(div5, file$m, 104, 6, 3043);
    			attr_dev(div6, "class", "player svelte-1xwg1c8");
    			toggle_class(div6, "dead", /*player*/ ctx[30].dead);
    			add_location(div6, file$m, 99, 5, 2811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, t5);
    			append_dev(div4, t6);
    			append_dev(div6, t7);

    			if (!mounted) {
    				dispose = listen_dev(
    					div6,
    					"click",
    					function () {
    						if (is_function(/*clickDonPlayer*/ ctx[13](/*player*/ ctx[30]))) /*clickDonPlayer*/ ctx[13](/*player*/ ctx[30]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*players*/ 64 && t1_value !== (t1_value = /*player*/ ctx[30].vote + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*players*/ 64 && t3_value !== (t3_value = /*player*/ ctx[30].name + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*players*/ 64 && t6_value !== (t6_value = /*player*/ ctx[30].id + "")) set_data_dev(t6, t6_value);

    			if (dirty[0] & /*players*/ 64) {
    				toggle_class(div6, "dead", /*player*/ ctx[30].dead);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(99:4) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    // (114:2) {#if selfPlayer.role === 'commissioner' }
    function create_if_block_7(ctx) {
    	let div0;
    	let t1;
    	let div4;
    	let div3;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*comTargetPlayer*/ ctx[2]) return create_if_block_8;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Кого будем проверять/убивать:";
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "Убить";
    			t3 = text("\r\n\t\t\t\t\t/\r\n\t\t\t\t\t");
    			div2 = element("div");
    			div2.textContent = "Проверить";
    			t5 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "svelte-1xwg1c8");
    			add_location(div0, file$m, 114, 3, 3275);
    			attr_dev(div1, "class", "svelte-1xwg1c8");
    			toggle_class(div1, "active", /*commissionerType*/ ctx[3] === "kill");
    			add_location(div1, file$m, 117, 5, 3482);
    			attr_dev(div2, "class", "svelte-1xwg1c8");
    			toggle_class(div2, "active", /*commissionerType*/ ctx[3] === "check");
    			add_location(div2, file$m, 119, 5, 3559);
    			attr_dev(div3, "class", "switchKillCheck svelte-1xwg1c8");
    			add_location(div3, file$m, 116, 4, 3355);
    			set_style(div4, "display", "flex");
    			attr_dev(div4, "class", "svelte-1xwg1c8");
    			add_location(div4, file$m, 115, 3, 3320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			insert_dev(target, t5, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*click_handler*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*commissionerType*/ 8) {
    				toggle_class(div1, "active", /*commissionerType*/ ctx[3] === "kill");
    			}

    			if (dirty[0] & /*commissionerType*/ 8) {
    				toggle_class(div2, "active", /*commissionerType*/ ctx[3] === "check");
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(114:2) {#if selfPlayer.role === 'commissioner' }",
    		ctx
    	});

    	return block;
    }

    // (129:3) {:else }
    function create_else_block_3(ctx) {
    	let div;
    	let each_value = /*players*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "playerList svelte-1xwg1c8");
    			add_location(div, file$m, 129, 4, 3926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*players, clickCommissionerPlayer*/ 16448) {
    				each_value = /*players*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(129:3) {:else }",
    		ctx
    	});

    	return block;
    }

    // (123:3) {#if comTargetPlayer }
    function create_if_block_8(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*comTargetPlayer*/ ctx[2].dead) return create_if_block_9;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(123:3) {#if comTargetPlayer }",
    		ctx
    	});

    	return block;
    }

    // (131:5) {#each players as player}
    function create_each_block$5(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1_value = /*player*/ ctx[30].vote + "";
    	let t1;
    	let t2;
    	let div5;
    	let div3;
    	let t3_value = /*player*/ ctx[30].name + "";
    	let t3;
    	let t4;
    	let div4;
    	let t5;
    	let t6_value = /*player*/ ctx[30].id + "";
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			t5 = text("Player ");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(div0, "class", "avatar svelte-1xwg1c8");
    			add_location(div0, file$m, 133, 8, 4133);
    			attr_dev(div1, "class", "showVote svelte-1xwg1c8");
    			add_location(div1, file$m, 134, 8, 4170);
    			attr_dev(div2, "class", "containerAvatar svelte-1xwg1c8");
    			add_location(div2, file$m, 132, 7, 4093);
    			attr_dev(div3, "class", "playerName svelte-1xwg1c8");
    			add_location(div3, file$m, 137, 8, 4253);
    			attr_dev(div4, "class", "playerId svelte-1xwg1c8");
    			add_location(div4, file$m, 138, 8, 4309);
    			attr_dev(div5, "class", "svelte-1xwg1c8");
    			add_location(div5, file$m, 136, 7, 4238);
    			attr_dev(div6, "class", "player svelte-1xwg1c8");
    			toggle_class(div6, "dead", /*player*/ ctx[30].dead);
    			add_location(div6, file$m, 131, 6, 3991);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, t5);
    			append_dev(div4, t6);
    			append_dev(div6, t7);

    			if (!mounted) {
    				dispose = listen_dev(
    					div6,
    					"click",
    					function () {
    						if (is_function(/*clickCommissionerPlayer*/ ctx[14](/*player*/ ctx[30]))) /*clickCommissionerPlayer*/ ctx[14](/*player*/ ctx[30]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*players*/ 64 && t1_value !== (t1_value = /*player*/ ctx[30].vote + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*players*/ 64 && t3_value !== (t3_value = /*player*/ ctx[30].name + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*players*/ 64 && t6_value !== (t6_value = /*player*/ ctx[30].id + "")) set_data_dev(t6, t6_value);

    			if (dirty[0] & /*players*/ 64) {
    				toggle_class(div6, "dead", /*player*/ ctx[30].dead);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(131:5) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {:else}
    function create_else_block_2(ctx) {
    	let t0;
    	let t1_value = /*comTargetPlayer*/ ctx[2].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*formatRole*/ ctx[10](/*comTargetPlayer*/ ctx[2].role) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			t0 = text("Вы проверили ");
    			t1 = text(t1_value);
    			t2 = text(", он ");
    			t3 = text(t3_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*comTargetPlayer*/ 4 && t1_value !== (t1_value = /*comTargetPlayer*/ ctx[2].name + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*comTargetPlayer*/ 4 && t3_value !== (t3_value = /*formatRole*/ ctx[10](/*comTargetPlayer*/ ctx[2].role) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(126:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#if comTargetPlayer.dead }
    function create_if_block_9(ctx) {
    	let t0;
    	let t1_value = /*comTargetPlayer*/ ctx[2].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*formatRole*/ ctx[10](/*comTargetPlayer*/ ctx[2].role) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			t0 = text("Вы убили ");
    			t1 = text(t1_value);
    			t2 = text(", он был ");
    			t3 = text(t3_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*comTargetPlayer*/ 4 && t1_value !== (t1_value = /*comTargetPlayer*/ ctx[2].name + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*comTargetPlayer*/ 4 && t3_value !== (t3_value = /*formatRole*/ ctx[10](/*comTargetPlayer*/ ctx[2].role) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(124:4) {#if comTargetPlayer.dead }",
    		ctx
    	});

    	return block;
    }

    // (150:1) {#if current.state === 'night_result' }
    function create_if_block_2(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*comTargetPlayer*/ ctx[2] && create_if_block_4(ctx);
    	let if_block1 = /*killedPlayer*/ ctx[1] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 150, 1, 4500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*comTargetPlayer*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*killedPlayer*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(150:1) {#if current.state === 'night_result' }",
    		ctx
    	});

    	return block;
    }

    // (152:2) {#if comTargetPlayer }
    function create_if_block_4(ctx) {
    	let div;

    	function select_block_type_3(ctx, dirty) {
    		if (/*comTargetPlayer*/ ctx[2].dead) return create_if_block_5;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 152, 3, 4536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(152:2) {#if comTargetPlayer }",
    		ctx
    	});

    	return block;
    }

    // (156:4) {:else }
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Комисар кого то проверил...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(156:4) {:else }",
    		ctx
    	});

    	return block;
    }

    // (154:4) {#if comTargetPlayer.dead }
    function create_if_block_5(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*comTargetPlayer*/ ctx[2].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*formatRole*/ ctx[10](/*comTargetPlayer*/ ctx[2].role) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Комисар убил ");
    			t1 = text(t1_value);
    			t2 = text(" Он был  ");
    			t3 = text(t3_value);
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 154, 5, 4581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*comTargetPlayer*/ 4 && t1_value !== (t1_value = /*comTargetPlayer*/ ctx[2].name + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*comTargetPlayer*/ 4 && t3_value !== (t3_value = /*formatRole*/ ctx[10](/*comTargetPlayer*/ ctx[2].role) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(154:4) {#if comTargetPlayer.dead }",
    		ctx
    	});

    	return block;
    }

    // (162:2) {#if killedPlayer }
    function create_if_block_3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*killedPlayer*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let t3_value = /*formatRole*/ ctx[10](/*killedPlayer*/ ctx[1].role) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Дон убил ");
    			t1 = text(t1_value);
    			t2 = text(" Он был  ");
    			t3 = text(t3_value);
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 162, 3, 4785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*killedPlayer*/ 2 && t1_value !== (t1_value = /*killedPlayer*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*killedPlayer*/ 2 && t3_value !== (t3_value = /*formatRole*/ ctx[10](/*killedPlayer*/ ctx[1].role) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(162:2) {#if killedPlayer }",
    		ctx
    	});

    	return block;
    }

    // (168:1) {#if current.state === 'end' }
    function create_if_block$2(ctx) {
    	let div;
    	let show_if;

    	function select_block_type_4(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*players*/ 64) show_if = !!/*players*/ ctx[6].filter(func).filter(func_1).length;
    		if (show_if) return create_if_block_1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_4(ctx, [-1]);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "svelte-1xwg1c8");
    			add_location(div, file$m, 168, 1, 4933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_4(ctx, dirty))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(168:1) {#if current.state === 'end' }",
    		ctx
    	});

    	return block;
    }

    // (172:2) {:else }
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Мирные жители победили");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(172:2) {:else }",
    		ctx
    	});

    	return block;
    }

    // (170:2) {#if players.filter(p => p.role === 'don').filter(p => !p.dead).length }
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Мафия победила");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(170:2) {#if players.filter(p => p.role === 'don').filter(p => !p.dead).length }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let t1_value = /*formatRole*/ ctx[10](/*selfPlayer*/ ctx[7] ? /*selfPlayer*/ ctx[7].role : "") + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3;

    	let t4_value = (/*selfPlayer*/ ctx[7] && /*selfPlayer*/ ctx[7].dead
    	? "мертвый"
    	: "живой") + "";

    	let t4;
    	let t5;
    	let div2;
    	let t6;
    	let t7;
    	let div3;
    	let t8;
    	let t9_value = /*formatTime*/ ctx[11](/*leftTime*/ ctx[9]) + "";
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let if_block0 = /*current*/ ctx[0].state === "init" && create_if_block_19(ctx);
    	let if_block1 = /*current*/ ctx[0].state === "day_to_night" && create_if_block_18(ctx);
    	let if_block2 = /*current*/ ctx[0].state === "night_to_day" && create_if_block_17(ctx);
    	let if_block3 = /*current*/ ctx[0].state === "day_vote" && create_if_block_16(ctx);
    	let if_block4 = /*current*/ ctx[0].state === "day_final_vote" && create_if_block_15(ctx);
    	let if_block5 = /*current*/ ctx[0].state === "day_final_vote_skip" && create_if_block_14(ctx);
    	let if_block6 = /*current*/ ctx[0].state === "day_vote_result" && create_if_block_12(ctx);
    	let if_block7 = /*current*/ ctx[0].state === "night" && create_if_block_6(ctx);
    	let if_block8 = /*current*/ ctx[0].state === "night_result" && create_if_block_2(ctx);
    	let if_block9 = /*current*/ ctx[0].state === "end" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text("Ваша роль: ");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text("Статус: ");
    			t4 = text(t4_value);
    			t5 = space();
    			div2 = element("div");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			div3 = element("div");
    			t8 = text("Осталось: ");
    			t9 = text(t9_value);
    			t10 = space();
    			if (if_block1) if_block1.c();
    			t11 = space();
    			if (if_block2) if_block2.c();
    			t12 = space();
    			if (if_block3) if_block3.c();
    			t13 = space();
    			if (if_block4) if_block4.c();
    			t14 = space();
    			if (if_block5) if_block5.c();
    			t15 = space();
    			if (if_block6) if_block6.c();
    			t16 = space();
    			if (if_block7) if_block7.c();
    			t17 = space();
    			if (if_block8) if_block8.c();
    			t18 = space();
    			if (if_block9) if_block9.c();
    			attr_dev(div0, "class", "svelte-1xwg1c8");
    			add_location(div0, file$m, 1, 1, 27);
    			attr_dev(div1, "class", "svelte-1xwg1c8");
    			add_location(div1, file$m, 2, 1, 101);
    			set_style(div2, "height", "20px");
    			attr_dev(div2, "class", "svelte-1xwg1c8");
    			add_location(div2, file$m, 3, 1, 178);
    			attr_dev(div3, "class", "svelte-1xwg1c8");
    			add_location(div3, file$m, 20, 1, 522);
    			attr_dev(div4, "class", "container svelte-1xwg1c8");
    			add_location(div4, file$m, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div4, t6);
    			if (if_block0) if_block0.m(div4, null);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, t8);
    			append_dev(div3, t9);
    			append_dev(div4, t10);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t11);
    			if (if_block2) if_block2.m(div4, null);
    			append_dev(div4, t12);
    			if (if_block3) if_block3.m(div4, null);
    			append_dev(div4, t13);
    			if (if_block4) if_block4.m(div4, null);
    			append_dev(div4, t14);
    			if (if_block5) if_block5.m(div4, null);
    			append_dev(div4, t15);
    			if (if_block6) if_block6.m(div4, null);
    			append_dev(div4, t16);
    			if (if_block7) if_block7.m(div4, null);
    			append_dev(div4, t17);
    			if (if_block8) if_block8.m(div4, null);
    			append_dev(div4, t18);
    			if (if_block9) if_block9.m(div4, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selfPlayer*/ 128 && t1_value !== (t1_value = /*formatRole*/ ctx[10](/*selfPlayer*/ ctx[7] ? /*selfPlayer*/ ctx[7].role : "") + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*selfPlayer*/ 128 && t4_value !== (t4_value = (/*selfPlayer*/ ctx[7] && /*selfPlayer*/ ctx[7].dead
    			? "мертвый"
    			: "живой") + "")) set_data_dev(t4, t4_value);

    			if (/*current*/ ctx[0].state === "init") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_19(ctx);
    					if_block0.c();
    					if_block0.m(div4, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*leftTime*/ 512 && t9_value !== (t9_value = /*formatTime*/ ctx[11](/*leftTime*/ ctx[9]) + "")) set_data_dev(t9, t9_value);

    			if (/*current*/ ctx[0].state === "day_to_night") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_18(ctx);
    					if_block1.c();
    					if_block1.m(div4, t11);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*current*/ ctx[0].state === "night_to_day") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_17(ctx);
    					if_block2.c();
    					if_block2.m(div4, t12);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*current*/ ctx[0].state === "day_vote") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_16(ctx);
    					if_block3.c();
    					if_block3.m(div4, t13);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*current*/ ctx[0].state === "day_final_vote") {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_15(ctx);
    					if_block4.c();
    					if_block4.m(div4, t14);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*current*/ ctx[0].state === "day_final_vote_skip") {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_14(ctx);
    					if_block5.c();
    					if_block5.m(div4, t15);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*current*/ ctx[0].state === "day_vote_result") {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_12(ctx);
    					if_block6.c();
    					if_block6.m(div4, t16);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*current*/ ctx[0].state === "night") {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_6(ctx);
    					if_block7.c();
    					if_block7.m(div4, t17);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*current*/ ctx[0].state === "night_result") {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_2(ctx);
    					if_block8.c();
    					if_block8.m(div4, t18);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*current*/ ctx[0].state === "end") {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block$2(ctx);
    					if_block9.c();
    					if_block9.m(div4, null);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = p => p.role === "don";
    const func_1 = p => !p.dead;

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Game", slots, []);
    	let state = "init";
    	let stateCtx;
    	let current;
    	state = "day-to-night";
    	state = "night";
    	state = "day";
    	let currentStore = new Set();
    	let killedPlayer = null;
    	let comTargetPlayer = null;
    	let commissionerType = "kill";
    	let elDayToNight, elNightToDay;

    	const formatRole = role => ({
    		don: "Дон мафии",
    		peaceful: "Мирный житель",
    		commissioner: "Комисар"
    	})[role];

    	const protoPlayer = () => ({
    		voteHangedPlayers: new Set(),
    		voteHangedFinalYesPlayers: new Set(),
    		voteHangedFinalNoPlayers: new Set(),
    		killedPlayers: new Set(),
    		checkPlayers: new Set(),
    		dead: false
    	});

    	class Bot {
    		constructor(options) {
    			Object.assign(this, options);
    			this.comCheckPlayers = new Set();
    		}

    		getAlivePlayers(withoutPlayers = [this]) {
    			return players.filter(p => !p.dead).filter(p => !withoutPlayers.includes(p));
    		}

    		getAliveRndPlayer(withoutPlayers = [this]) {
    			const ps = this.getAlivePlayers(withoutPlayers);
    			return ps[Math.random() * ps.length | 0];
    		}

    		tick() {
    			if (this.dead) return;

    			switch (current.state) {
    				case "day_vote":
    					if (Math.random() > 0.3) break;
    					this.dayVotePlayer = this.getAliveRndPlayer();
    					if (this.dayVotePlayer) current.vote(this, this.dayVotePlayer);
    					break;
    				case "day_final_vote":
    					if (playerHanged === this.dayVotePlayer) current.vote(this, 1);
    					break;
    				case "night":
    					if (this.role === "peaceful") break;
    					if (this.role === "don") {
    						const p = this.getAliveRndPlayer();
    						if (p) current.kill(this, p);
    						break;
    					}
    					if (this.role === "commissioner") {
    						const ps = [...this.comCheckPlayers];
    						const p = this.getAliveRndPlayer([...ps, this]);
    						const don = ps.find(p => p.role === "don");

    						if (don) {
    							console.log("com kill " + don.name);
    							$$invalidate(3, commissionerType = "kill");
    							current.commissionerAction(this, don);
    							break;
    						}

    						console.log("com check " + p.name);
    						$$invalidate(3, commissionerType = "check");
    						current.commissionerAction(this, p);
    						if (comTargetPlayer) this.comCheckPlayers.add(comTargetPlayer);
    						break;
    					}
    					break;
    			}
    		}
    	}

    	function setup() {
    		const _players = [
    			"Lupusregina[beta]",
    			"pacificescape",
    			"Alex Kovalev",
    			"bakunov",
    			"Den ri",
    			"js - one love",
    			"𝖁𝖑𝖆𝖉"
    		];

    		$$invalidate(6, players = []);

    		players.push($$invalidate(7, selfPlayer = {
    			id: _players.length,
    			name: "*SELF*",
    			vote: 0,
    			voteFinal: 0,
    			bote: false,
    			...protoPlayer()
    		}));

    		players.push(..._players.map((v, i) => new Bot({
    				id: i,
    				name: v,
    				vote: 0,
    				voteFinal: 0,
    				bot: true,
    				...protoPlayer()
    			})));

    		const addRndRole = role => {
    			const ps = players.filter(p => !p.role);
    			const p = ps[Math.random() * ps.length | 0];
    			if (!p) return false;
    			p.role = role;
    			return true;
    		};

    		//selfPlayer.role = 'commissioner'
    		addRndRole("don");

    		addRndRole("commissioner");

    		while (addRndRole("peaceful")) {
    			
    		}

    		setState("night");
    		$$invalidate(6, players);
    		$$invalidate(7, selfPlayer);
    		globalThis.players = players;
    		globalThis.selfPlayer = selfPlayer;
    	}

    	let players = [];
    	let selfPlayer;
    	setTimeout(setup);
    	const formatTime = t => `${t / 60 | 0}:${String(t % 60).padStart(2, "0")}`;
    	let playerHanged = null;
    	let playerHangedVoteFinal = 0;

    	const setState = _state => {
    		$$invalidate(0, current = states[_state]);
    		currentStore = new Set();
    		current.begin();
    		players.filter(p => p.bot).map(p => p.tick());
    	};

    	const checkEnd = next => {
    		const don = players.find(p => p.role === "don");
    		if (don.dead) return setState("end");
    		if (players.filter(p => !p.dead).length <= 2) return setState("end");
    		setState(next);
    	};

    	const states = {
    		day_vote: {
    			begin() {
    				$$invalidate(9, leftTime = 5);
    			},
    			end() {
    				const selectPlayers = players.sort((l, r) => r.voteHangedPlayers.size - l.voteHangedPlayers.size).filter(p => p.voteHangedPlayers.size);

    				if (!selectPlayers.length || selectPlayers.length > 1 && selectPlayers[0].voteHangedPlayers.size === selectPlayers[1].voteHangedPlayers.size) {
    					setState("day_final_vote_skip");
    					return;
    				}

    				$$invalidate(8, playerHanged = selectPlayers[0]);
    				setState("day_final_vote");
    			},
    			vote(player, playerVote) {
    				if (player.dead || playerVote.dead) return;
    				if (player === playerVote) return;

    				if (playerVote.voteHangedPlayers.has(player)) playerVote.voteHangedPlayers.delete(player); else {
    					players.map(p => p.voteHangedPlayers.delete(player));
    					playerVote.voteHangedPlayers.add(player);
    				}

    				$$invalidate(6, players);
    			}
    		},
    		day_final_vote: {
    			begin() {
    				$$invalidate(9, leftTime = 5);
    			},
    			end() {
    				const delta = playerHanged.voteHangedFinalYesPlayers.size - playerHanged.voteHangedFinalNoPlayers.size;
    				if (!delta) return setState("day_final_vote_skip");
    				if (delta > 0) $$invalidate(8, playerHanged.dead = true, playerHanged);
    				setState("day_vote_result");
    			},
    			vote(player, dir) {
    				if (player.dead) return;
    				if (player === playerHanged) return;

    				const toggle = (s, v) => {
    					if (s.has(v)) s.delete(v); else {
    						[
    							playerHanged.voteHangedFinalYesPlayers,
    							playerHanged.voteHangedFinalNoPlayers
    						].map(s => s.delete(v));

    						s.add(v);
    					}
    				};

    				if (dir > 0) {
    					toggle(playerHanged.voteHangedFinalYesPlayers, player);
    				} else {
    					toggle(playerHanged.voteHangedFinalNoPlayers, player);
    				}

    				$$invalidate(6, players);
    				$$invalidate(8, playerHanged);
    			}
    		},
    		day_final_vote_skip: {
    			begin() {
    				$$invalidate(9, leftTime = 5);
    			},
    			end() {
    				setState("day_to_night");
    			}
    		},
    		day_vote_result: {
    			begin() {
    				$$invalidate(9, leftTime = 5);
    			},
    			end() {
    				checkEnd("day_to_night");
    			}
    		},
    		day_to_night: {
    			begin() {
    				$$invalidate(9, leftTime = 2);
    			},
    			end() {
    				setState("night");
    			}
    		},
    		night: {
    			begin() {
    				$$invalidate(9, leftTime = 5);
    			},
    			end() {
    				setState("night_to_day");
    			},
    			kill(donPlayer, killPlayer) {
    				if (donPlayer.dead || killPlayer.dead) return;
    				if (donPlayer === killPlayer) return;
    				if (killedPlayer) return;
    				if (donPlayer.role !== "don") return;
    				if (killPlayer.dead) return;
    				killPlayer.dead = true;
    				donPlayer.killedPlayers.add(killPlayer);
    				$$invalidate(1, killedPlayer = killPlayer);
    				$$invalidate(6, players);
    			},
    			commissionerAction(comPlayer, tarPlayer) {
    				if (comPlayer.dead || tarPlayer.dead) return;
    				if (comPlayer === tarPlayer) return;
    				if (comPlayer.role !== "commissioner") return;
    				if (tarPlayer.dead) return;
    				if (comTargetPlayer) return;

    				if (commissionerType === "kill") {
    					tarPlayer.dead = true;
    					comPlayer.killedPlayers.add(tarPlayer);
    				} else {
    					if (comPlayer.checkPlayers.has(tarPlayer)) return;
    					comPlayer.checkPlayers.add(tarPlayer);
    				}

    				$$invalidate(2, comTargetPlayer = tarPlayer);
    				$$invalidate(6, players);
    			}
    		},
    		night_to_day: {
    			begin() {
    				$$invalidate(9, leftTime = 2);
    			},
    			end() {
    				setState("night_result");
    			}
    		},
    		night_result: {
    			begin() {
    				$$invalidate(9, leftTime = 5);
    			},
    			end() {
    				$$invalidate(2, comTargetPlayer = null);
    				$$invalidate(1, killedPlayer = null);
    				checkEnd("day_vote");
    			}
    		},
    		end: {
    			begin() {
    				$$invalidate(9, leftTime = 60 * 60);
    			},
    			end() {
    				
    			}
    		}
    	};

    	Object.entries(states).map(v => v[1].state = v[0]);
    	current = states.day_vote;

    	//$: console.log({ current })
    	let leftTime = 200;

    	setInterval(
    		() => {
    			$$invalidate(9, leftTime--, leftTime);

    			if (leftTime === 0) {
    				current.end();
    			}
    		},
    		1000
    	);

    	let playerVote = null;

    	const clickPlayer = player => e => {
    		current.vote(selfPlayer, player);
    	};

    	const clickDonPlayer = player => e => {
    		current.kill(selfPlayer, player);
    	};

    	const clickCommissionerPlayer = player => e => {
    		current.commissionerAction(selfPlayer, player);
    	};

    	const clickPlayerFinalVote = dir => e => {
    		current.vote(selfPlayer, dir);
    	};

    	globalThis.ss = s => state = s;
    	globalThis.players = players;
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			elDayToNight = $$value;
    			$$invalidate(4, elDayToNight);
    		});
    	}

    	function video_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			elNightToDay = $$value;
    			$$invalidate(5, elNightToDay);
    		});
    	}

    	const click_handler = () => $$invalidate(3, commissionerType = ["kill", "check"].find(v => v !== commissionerType));

    	$$self.$capture_state = () => ({
    		state,
    		stateCtx,
    		current,
    		currentStore,
    		killedPlayer,
    		comTargetPlayer,
    		commissionerType,
    		elDayToNight,
    		elNightToDay,
    		formatRole,
    		protoPlayer,
    		Bot,
    		setup,
    		players,
    		selfPlayer,
    		formatTime,
    		playerHanged,
    		playerHangedVoteFinal,
    		setState,
    		checkEnd,
    		states,
    		leftTime,
    		playerVote,
    		clickPlayer,
    		clickDonPlayer,
    		clickCommissionerPlayer,
    		clickPlayerFinalVote
    	});

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) state = $$props.state;
    		if ("stateCtx" in $$props) stateCtx = $$props.stateCtx;
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("currentStore" in $$props) currentStore = $$props.currentStore;
    		if ("killedPlayer" in $$props) $$invalidate(1, killedPlayer = $$props.killedPlayer);
    		if ("comTargetPlayer" in $$props) $$invalidate(2, comTargetPlayer = $$props.comTargetPlayer);
    		if ("commissionerType" in $$props) $$invalidate(3, commissionerType = $$props.commissionerType);
    		if ("elDayToNight" in $$props) $$invalidate(4, elDayToNight = $$props.elDayToNight);
    		if ("elNightToDay" in $$props) $$invalidate(5, elNightToDay = $$props.elNightToDay);
    		if ("players" in $$props) $$invalidate(6, players = $$props.players);
    		if ("selfPlayer" in $$props) $$invalidate(7, selfPlayer = $$props.selfPlayer);
    		if ("playerHanged" in $$props) $$invalidate(8, playerHanged = $$props.playerHanged);
    		if ("playerHangedVoteFinal" in $$props) playerHangedVoteFinal = $$props.playerHangedVoteFinal;
    		if ("leftTime" in $$props) $$invalidate(9, leftTime = $$props.leftTime);
    		if ("playerVote" in $$props) playerVote = $$props.playerVote;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*elDayToNight*/ 16) {
    			 elDayToNight && elDayToNight.play();
    		}

    		if ($$self.$$.dirty[0] & /*elNightToDay*/ 32) {
    			 elNightToDay && elNightToDay.play();
    		}
    	};

    	return [
    		current,
    		killedPlayer,
    		comTargetPlayer,
    		commissionerType,
    		elDayToNight,
    		elNightToDay,
    		players,
    		selfPlayer,
    		playerHanged,
    		leftTime,
    		formatRole,
    		formatTime,
    		clickPlayer,
    		clickDonPlayer,
    		clickCommissionerPlayer,
    		clickPlayerFinalVote,
    		video_binding,
    		video_binding_1,
    		click_handler
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* C:\MISC\Projects\NODEJS-PetMafia\mafia-game-process-game-svelte-version\src\App.svelte generated by Svelte v3.29.4 */
    const file$n = "C:\\MISC\\Projects\\NODEJS-PetMafia\\mafia-game-process-game-svelte-version\\src\\App.svelte";

    function create_fragment$n(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div1;
    	let header;
    	let t1;
    	let div2;
    	let switch_instance;
    	let current;
    	header = new Header({ $$inline: true });
    	var switch_value = /*pageComponent*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			create_component(header.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "background svelte-188k38y");
    			add_location(div0, file$n, 1, 1, 8);
    			attr_dev(div1, "class", "headerWrapper");
    			add_location(div1, file$n, 3, 1, 42);
    			attr_dev(div2, "class", "content svelte-188k38y");
    			add_location(div2, file$n, 7, 1, 95);
    			add_location(main, file$n, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			mount_component(header, div1, null);
    			append_dev(main, t1);
    			append_dev(main, div2);

    			if (switch_instance) {
    				mount_component(switch_instance, div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*pageComponent*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div2, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let pageComponent;
    	router.add(/^\/$/, () => $$invalidate(0, pageComponent = Main));
    	router.add(/^\/game-rules$/, () => $$invalidate(0, pageComponent = GameRules));
    	router.add(/^\/current-games$/, () => $$invalidate(0, pageComponent = CurrentGames$1));
    	router.add(/^\/game$/, () => $$invalidate(0, pageComponent = Game));
    	window.addEventListener("popstate", () => router.goWithoutPushState(location.pathname));
    	router.goWithoutPushState(location.pathname);
    	window.router = router;

    	class RuntimeAddStyleSheet {
    		constructor(styles, onDestroy) {
    			this.elStyle = document.createElement("style");
    			this.elStyle.type = "text/css";
    			this.elStyle.innerText = styles;
    			this.attached = false;
    			if (onDestroy) onDestroy(() => this.detach);
    		}

    		update(styles) {
    			this.elStyle.innerText = styles;
    		}

    		attach() {
    			if (this.attached) return;
    			this.attached = true;
    			(document.head || document.body).appendChild(this.elStyle);
    		}

    		detach() {
    			if (!this.attached) return;
    			this.attached = false;
    			this.elStyle.parentNode.removeChild(this.elStyle);
    		}
    	}

    	const rass = new RuntimeAddStyleSheet("");
    	rass.attach();

    	const updateWidthRate = () => {
    		let widthRate = window.innerWidth / 1920;
    		let heightRate = window.innerHeight / 1080;

    		//widthRate = Math.max(widthRate, 0.5)
    		rass.update(`
		:root {
			--widthRate : ${widthRate};
			--heightRate: ${heightRate};
			--devicePixelRatio: ${devicePixelRatio};
		}
		html {
			font-size: ${widthRate}px;
		}
	`);
    	};

    	window.addEventListener("resize", updateWidthRate);
    	updateWidthRate();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Main,
    		GameRules,
    		CurrentGames: CurrentGames$1,
    		Game,
    		router,
    		pageComponent,
    		RuntimeAddStyleSheet,
    		rass,
    		updateWidthRate
    	});

    	$$self.$inject_state = $$props => {
    		if ("pageComponent" in $$props) $$invalidate(0, pageComponent = $$props.pageComponent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pageComponent];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
