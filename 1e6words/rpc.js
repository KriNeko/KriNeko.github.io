class Rpc {
	constructor(methods = {}, onOut) {
		this.rpcID = 1
		this.methods = methods
		this.onOut = onOut
		
		this.waitCtx = {}
		this.outList = []

		return new Proxy(this, {
			get: (target, method) => {
				if ( typeof target[method] === "function" )
					return target[method].bind(target)

				return (...args) => this._call(method, ...args)
			}
		})
	}

	_getAndDelWaitCtx(rpcID) {
		const waitCtx = this.waitCtx[ rpcID ]
		if ( !waitCtx )
			return
		delete this.waitCtx[ rpcID ]
		return waitCtx
	}
	_addWaitCtx(rpcID, resolve, reject) {
		this.waitCtx[rpcID] = { rpcID, resolve, reject }
	}
	_writeOut() {
		if ( !this.onOut )
			return
		
		for(const out of this.outList)
			this.onOut(out)
		
		this.outList = []
	}
	async _readIn(data) {
		try {
			const { method, rpcID, args, result, error } = JSON.parse(data)
			if ( !method ) {
				const waitCtx = this._getAndDelWaitCtx(rpcID)
				if ( !waitCtx )
					return
				
				if ( error )
					waitCtx.reject(error)
				waitCtx.resolve(result)
				return
			}
			
			if ( !args )
				return
			
			try {
				this._writeResult(rpcID, await this._retCall(method, args, rpcID))
			} catch(e) {
				this._writeResult(rpcID, undefined, e)
			}
		} catch(e) { }
	}
	async _retCall(method, args, rpcID) {
		if ( typeof this.methods[method] !== "function" )
			throw new Error(`Method '${method}' not found`)
		
		return await this.methods[method](...args)
	}
	_writeResult(rpcID, result, error) {
		if ( error )
			error = {message: error.message, name: error.name}
		this.outList.push( JSON.stringify( { rpcID, result, error } ) )
		this._writeOut()
	}
	_writeCall(rpcID, method, args) {
		this.outList.push( JSON.stringify( { method, args, rpcID } ) )
		this._writeOut()
	}
	async _call(method, ...args) {
		return new Promise((resolve, reject) => {
			const rpcID = this.rpcID++
			this._addWaitCtx(rpcID, resolve, reject)
			this._writeCall(rpcID, method, args)
		})
	}
	
	addMethods(methods) {
		Object.assign(this.methods, methods)
	}
	
	setOut(onOut) {
		this.onOut = onOut
		this._writeOut()
	}
	getIn() {
		return this._readIn.bind(this)
	}
}

export { Rpc }