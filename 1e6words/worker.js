
const sleep = m => new Promise(r => setTimeout(r, m))

const idbResultPromiseWrapper = v => new Promise((d, f) => (v.onsuccess = d, v.onerror = f))
class IDB {
	constructor(dbName, objectStoreName, keyPath, indexList = []) {
		this.dbName = dbName
		this.objectStoreName = objectStoreName
		this.keyPath = keyPath
		this.indexList = indexList

		this.db = null
	}
	
	async open() {
		return new Promise((d,f) => {

			const rqIndexDB = globalThis.indexedDB.open(this.dbName, 3);
			rqIndexDB.onerror = event => {
				f(event)
			}
			rqIndexDB.onupgradeneeded = event => {
				const db = event.target.result;
				const objectStore = db.createObjectStore(this.objectStoreName, { keyPath: this.keyPath });
				this.indexList.map(i => {
					if ( typeof i === "string" )
						i = {indexName: i, keyPath: i, unique: false}
					objectStore.createIndex(i.indexName, i.keyPath, i)
				})
			}
			rqIndexDB.onsuccess = event => {
				this.db = event.target.result;
				d(this.db)
			}

		})
	}
	transaction(mode = "readwrite") {
		if ( !this.db )
			return null
		return this.db.transaction([this.objectStoreName], mode);
	}
	objectStore(mode = "readwrite") {
		const t = this.transaction(mode)
		if ( !t )
			return null 
		
		return t.objectStore(this.objectStoreName)
	}
}
class IDBKeyValue extends IDB {
	constructor(name, tb = "kv-tb") {
		super(name, tb, "key", [])
	}

	async get(key) {
		const r = (await idbResultPromiseWrapper( this.objectStore().get( key ) )).target.result
		return r && r.value
	}
	async set(key, value) {
		return idbResultPromiseWrapper( this.objectStore().put({ key, value }) )
	}
	async add(key, value) {
		return idbResultPromiseWrapper( this.objectStore().add({ key, value }) )
	}
}

class PromiseEx {
	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
	}
}
class LockAsync {
	constructor() {
		this.promiseEx = null
	}

	async lock(cbAsync) {
		if ( this.promiseEx ) {
			try {
				await this.promiseEx.promise
			} catch(e) {}
			return await this.lock(cbAsync)
		}
			
		const p = this.promiseEx = new PromiseEx()
		
			let result, error, done = false
			try {
				result = await cbAsync()
				done = true
			} catch(e) {
				error = e
			}
			
			this.promiseEx = null
			done ? p.resolve(result) : p.reject(error)
		
		return p.promise
	}
	isActive() {
		return !!this.promiseEx
	}
}
class LockAsyncMap {
	constructor() {
		this.map = new Map()
	}
	
	async lock(key, cbAsync) {
		let lockAsync = this.map.get(key)
		if ( !lockAsync ) {
			lockAsync = new LockAsync()
			this.map.set(key, lockAsync)
		}

		let result, error, done = false
		try {
			result = await lockAsync.lock(cbAsync)
			done = true
		} catch(e) {
			error = e
		}
		
		if ( !lockAsync.isActive() )
			this.map.delete(key)
		
		if ( done )
			return result
		
		throw error
	}
}

class MemoryAsyncLoadError {
}
class Memory {
	constructor(pageBytesNumBits = 20, view = Int32Array, idbkv) {
		this.pageBytesNumBits = pageBytesNumBits
		this.view = view
		this.idbkv = idbkv
		
		this.pageNumBits = this.pageBytesNumBits - Math.log2(this.view.BYTES_PER_ELEMENT)
		this.pageSize = 1 << this.pageNumBits
		this.pageList = []
		this.pageLock = new LockAsyncMap()
		
		this.mallocOffset = 4
		this.pageListLoad = []
	}
	
	async open() {
		await this.loadPageAsync(0)
		this.readMallocOffset()
	}
	async save() {
		this.writeMallocOffset()
		await this.savePageList()
	}

	readMallocOffset() {
		const page = this.pageList[0]
		if ( !page )
			return
		
		this.mallocOffset = 0
		for(let i = 0; i < 4; i++)
			this.mallocOffset |= (page[i] & 0xFF) << (i*8)
		
		this.mallocOffset = Math.max(this.mallocOffset, 4)
		this.writeMallocOffset()
	}
	writeMallocOffset() {
		const page = this.pageList[0]
		if ( !page )
			return
		for(let i = 0; i < 4; i++)
			page[i] = (this.mallocOffset >>> (i*8)) & 0xFF
	}

	async loadPageAsync(pageIndex) {
		return await this.pageLock.lock(pageIndex, async() => {
			let page
			
			if ( this.idbkv )
				page = await this.idbkv.get(pageIndex)
			
			if ( !page )
				page = new this.view( this.pageSize )
				
			this.pageList[ pageIndex ] = page	
		})
	}
	async loadPageList() {
		for(const pageIndex of this.pageListLoad)
			await this.loadPageAsync(pageIndex)
		this.pageListLoad = []
	}
	async savePage(pageIndex, andDelete = false) {
		return await this.pageLock.lock(pageIndex, async() => {
			if ( pageIndex === 0 )
				this.writeMallocOffset()

			const page = this.pageList[pageIndex]
			if ( !page )
				return
			console.log("savePage", pageIndex)
			await this.idbkv.set(pageIndex, page)
			if ( andDelete )
				this.pageList[pageIndex] = null
		})
	}
	async savePageList(andDelete = false) {
		for(const pageIndex of this.pageList.map((v, i) => i))
			await this.savePage(pageIndex, andDelete)
	}

	loadPage(pageIndex) {
		const page = this.pageList[ pageIndex ]
		if ( page )
			return page
		
		if ( this.idbkv ) {
			this.pageListLoad.push(pageIndex)
			throw new MemoryAsyncLoadError()
		}
		
		return this.pageList[ pageIndex ] = new this.view( this.pageSize )
	}

	load(offset) {
		const page = this.loadPage( offset >> this.pageNumBits )
		return page.subarray( offset & ((1 << this.pageNumBits) - 1) )
	}
	
	eternalMalloc(size) {
		if ( size > this.pageSize )
			return null
		
		if ( ( (this.mallocOffset + size) >> this.pageNumBits ) > ( this.mallocOffset >> this.pageNumBits) )
			this.mallocOffset = ( (this.mallocOffset >> this.pageNumBits) + 1 ) << this.pageNumBits
		
		const result = this.mallocOffset
		this.mallocOffset += size
		return result
	}
	
	getEternalMallocOffset() {
		return this.mallocOffset
	}

	getPageIndex(offset) {
		return offset >> this.pageNumBits
	}
}

const makeNode = strLen => {
	/**
	struct node {
		i32 char;
		i32 childNode;
		i32 nextNode;
		i32 numLeafs;
	}
	*/
	const size = 4
	return class {
		constructor(i32array, offset = 0) {
			this.i32array = i32array
			this.offset = offset
		}

		get iChar()         { return this.i32array[ this.offset + 0 ] }
		set iChar(val)      { return this.i32array[ this.offset + 0 ] = val }
		get iChildNode()    { return this.i32array[ this.offset + 1 ] }
		set iChildNode(val) { return this.i32array[ this.offset + 1 ] = val }
		get iNextNode()     { return this.i32array[ this.offset + 2 ] }
		set iNextNode(val)  { return this.i32array[ this.offset + 2 ] = val }
		get iNumLeafs()     { return this.i32array[ this.offset + 3 ] }
		set iNumLeafs(val)  { return this.i32array[ this.offset + 3 ] = val }
		
		get char() {
			return String.fromCharCode(this.iChar)
		}
		set char(val) {
			this.iChar = val.charCodeAt()
		}
		get text() {
			return this.char
		}
		set text(val) {
			this.char = val
		}
				
		
		
		static get size() { return size }
		get size() { return size }
	}
}
const makeNodeLeaf = strLen => {
	/**
	struct node_leaf {
		i32 nextNode;
		i32 length;
		i32 textIndex;
		i32 char;
	}
	*/
	
	const size = 4
	return class {
		constructor(i32array, offset = 0) {
			this.i32array = i32array
			this.offset = offset
		}

		get iNextNode()     { return this.i32array[ this.offset + 0 ] }
		set iNextNode(val)  {        this.i32array[ this.offset + 0 ] = val }
		get iLength()       { return this.i32array[ this.offset + 1 ] }
		set iLength(val)    {        this.i32array[ this.offset + 1 ] = val }
		get iTextIndex()    { return this.i32array[ this.offset + 2 ] }
		set iTextIndex(val) {        this.i32array[ this.offset + 2 ] = val }
		get iChar()         { return this.i32array[ this.offset + 3 ] }
		set iChar(val)      { return this.i32array[ this.offset + 3 ] = val }
		
		get char() {
			return String.fromCharCode(this.iChar & 0xFFFF)
		}
		set char(val) {
			this.iChar = (this.iChar & 0xFFFF0000) | val.charCodeAt()
		}
		
		get isEnd() {
			return this.iChar < 0
		}
		set isEnd(val) {
			this.iChar |= 1 << 31
		}
		
		static get size() { return size }
		get size() { return size }
	}
}

const Node = makeNode()
const NodeLeaf = makeNodeLeaf()

class StackOffsetMalloc {
	constructor(memory, size) {
		this.memory = memory
		this.size = size
		this.stack = []
	}
	malloc() {
		return this.stack.pop() || this.memory.eternalMalloc(this.size)
	}
	free(offset) {
		this.stack.push(offset)
	}
}
class WordMemory {
	constructor(pageBytesNumBits = 20, idbkv) {
		this.wordMemory = new Memory(pageBytesNumBits, Uint16Array, idbkv)
	}

	async load() {
		await this.wordMemory.loadPageList()
	}

	getWord(wordOffset) {
		return this.wordMemory.load(wordOffset)
	}
	getWordString(wordOffset) {
		const wordData = this.getWord(wordOffset)
		let s = ""
		for(let i = 0; i < wordData[0]; i++)
			s += String.fromCharCode(wordData[1 + i])
		return s
	}
	addWord(word) {
		const wordOffset = this.wordMemory.eternalMalloc( word.length + 1 )
		const u16array = this.wordMemory.load(wordOffset)
		u16array[0] = word.length
		for(let i = 0; i < word.length; i++)
			u16array[i + 1] = word.charCodeAt(i)
		return wordOffset
	}
}
class WordMemoryUTF8 {
	constructor(pageBytesNumBits = 20, idbkv) {
		this.wordMemory = new Memory(pageBytesNumBits, Uint8Array, idbkv)
		this.textEncoderUTF8 = new TextEncoder("utf-8")
		this.textDecoderUTF8 = new TextDecoder("utf-8")
	}

	async load() {
		await this.wordMemory.loadPageList()
	}
	
	
	addWord(word) {
		const u8word = this.textEncoderUTF8.encode(word)
		
		const wordOffset = this.wordMemory.eternalMalloc( u8word.length + 2 )
		const u8array = this.wordMemory.load(wordOffset)
		u8array[0] = u8word.length & 0xFF
		u8array[1] = (u8word.length >> 8) & 0xFF
		for(let i = 0; i < u8word.length; i++)
			u8array[i + 2] = u8word[i]
		return wordOffset
	}
	
	getWordString(wordOffset) {
		const wordData = this.wordMemory.load(wordOffset)
		let s = ""
		const len = wordData[0] | (wordData[1] << 8)
		return this.textDecoderUTF8.decode(wordData.slice(2, len + 2))
	}
}

class TreeMemory {
	constructor(idbkv, idbkvWords) {
		this.memory = new Memory(20, Int32Array, idbkv)
		//this.wordMemory = new WordMemory(20)
		this.wordMemory = new WordMemoryUTF8(20, idbkvWords)
		
		this.wordCacheLength = 20
		this.wordCacheMemory = new WordMemory(20)
		this.wordCacheMap = {}

		//const pRoot = this.memory.eternalMalloc(Node.size)
		this.root = new Node(new Int32Array(1024))
		this.root.iNumLeafs = 0
		
		this.nodeMemory = new StackOffsetMalloc(this.memory, Node.size)
		this.nodeLeafMemory = new StackOffsetMalloc(this.memory, NodeLeaf.size)
	}
	
	async open() {
		await this.memory.open()
		await this.memory.loadPageAsync(0)
		await this.wordMemory.wordMemory.open()
		
		if ( this.memory.getEternalMallocOffset() === 4 )
			this.memory.eternalMalloc(Node.size)
		
		this.root = new Node(this.memory.load(4))
	}
	async save() {
		await this.memory.save()
		await this.wordMemory.wordMemory.save()
	}
	
	async saveNotSafeStringsAsync() {
		const mem = this.wordMemory.wordMemory
		const pageIndexMax = mem.getPageIndex(mem.getEternalMallocOffset())
		const pageIndexList = mem.pageList.map((v, i) => i).filter(pageIndex => pageIndex < pageIndexMax)
		//console.log({pageIndexMax}, pageIndexList)
		for(let pageIndex of pageIndexList) {
			await mem.savePage(pageIndex, true)
		}
	}
	
	async load() {
		await this.memory.loadPageList()
		await this.wordMemory.load()
	}

	getWord(wordOffset, validIndex = -1) {
		if ( validIndex !== -1 ) {
			const wordCacheOffset =  this.wordCacheMap[ wordOffset ]
			if ( wordCacheOffset !== undefined ) {
				const wordData = this.wordCacheMemory.getWord(wordCacheOffset)
				const wordCacheLength = wordData[0]
				if ( validIndex < wordCacheLength )
					return wordData				
			}
		}
		
		console.log("...")
		
		const s = this.wordMemory.getWordString(wordOffset)
		const wordData =  new Uint16Array(1 + s.length)
		wordData[0] = s.length
		for(let i = 0; i < s.length; i++)
			wordData[i+1] = s.charCodeAt(i)
		
		return wordData
	}
	getWordString(wordOffset) {
		return this.wordMemory.getWordString(wordOffset)
	}
	addWord(word) {
		let wordOffset = this.wordMemory.addWord(word)
		this.wordCacheMemory.wordMemory.mallocOffset
		const wordCacheOffset = this.wordCacheMemory.addWord(word.slice(0, this.wordCacheLength))
		wordOffset = wordCacheOffset
		this.wordCacheMap[ wordOffset ] = wordCacheOffset
		return wordOffset
	}

	*eachNode(pNode) {
		let node
		while(pNode) {
			if ( pNode > 0 ) {
				node = new Node(this.memory.load(pNode))
			} else {
				pNode = ~pNode
				node = new NodeLeaf(this.memory.load(pNode))
			}
			node.pNode = pNode
			yield node

			pNode = node.iNextNode
		}
	}

	createNode(text = "") {
		const pNode = this.nodeMemory.malloc()
		const node = new Node(this.memory.load(pNode))
		node.text = text
		node.iNextNode = 0
		node.iChildNode = 0
		return [pNode, node]
	}	
	createNodeLeaf(text = "") {
		const pNodeLeaf = this.nodeLeafMemory.malloc()
		const nodeLeaf = new NodeLeaf(this.memory.load(pNodeLeaf))
		nodeLeaf.text = text
		nodeLeaf.iNextNode = 0
		return [pNodeLeaf, nodeLeaf]
	}

	add(word, node = this.root) {
		const path = [node]
		again:
		for(let i = 0; i < word.length; i++) {
			const char = word[i]
			
			let prev = [node, "iChildNode"]
			for(const childNode of this.eachNode(node.iChildNode)) {
				
				if ( childNode.char !== char ) {
					prev = [childNode, "iNextNode"]
					continue
				}
				
				if ( childNode instanceof Node ) {
					node = childNode
					path.push(node)
					continue again
				}
				
				if ( childNode.isEnd ) {
					prev = [childNode, "iNextNode"]
					continue
				}
				
				const wordData = this.getWord( childNode.iTextIndex, i + 1 )
				
				const [pNode, newNode] = this.createNode(char)
				
				prev[0][prev[1]] = pNode
				newNode.iNextNode = childNode.iNextNode
				newNode.iChildNode = ~childNode.pNode
				newNode.iNumLeafs = 1
				
				childNode.iNextNode = 0
								
				if ( i === wordData[0] - 1 ) {
					childNode.isEnd = true
					childNode.char = "\xFFFF"
				} else {
					childNode.iChar = wordData[1 + i + 1]
				}
				
				node = newNode
				path.push(node)
				continue again
			}
			
			const [pNodeLeaf, nodeLeaf] = this.createNodeLeaf( word.slice(i) )
			const wordOffset = this.addWord(word)

			path.map(node => node.iNumLeafs++)
			
			nodeLeaf.iNextNode = node.iChildNode
			nodeLeaf.iTextIndex = wordOffset
			nodeLeaf.char = word[i]
			node.iChildNode = ~pNodeLeaf
			
			break
		}
	}
	async addAsync(word, node = this.root) {
		try {
			this.add(word, node)
		} catch(e) {
			if ( !(e instanceof MemoryAsyncLoadError) ) 
				throw e
			
			await this.load()
			await this.addAsync(word, node)
		}
	}

	each(node = this.root, parent = "", deep = 0) {
		//console.log(":", node.text);
		for(const childNode of this.eachNode(node.iChildNode)) {
			//console.log(childNode)
			if ( childNode instanceof NodeLeaf ) {
				const word = this.getWordString(childNode.iTextIndex)
				//const word = this.wordList[ childNode.iTextIndex ]
				console.log(" ".repeat(deep), "::", childNode.char, word, childNode.iNumLeafs)
			} else {
				console.log(" ".repeat(deep), ":", childNode.char, childNode.iNumLeafs)
				this.each(childNode, parent + childNode.char, deep + 1)
			}
		}		
	}
	
	likeStringCount(pattern, node = this.root, i = 0) {
		if ( i >= pattern.length )
			return node.iNumLeafs

		for(const childNode of this.eachNode(node.iChildNode)) {
			if ( childNode.char !== pattern[i] )
				continue
			
			//console.log(childNode.char, childNode.iNumLeafs)
			if ( childNode instanceof NodeLeaf ) {
				const word = this.getWordString(childNode.iTextIndex)
				//const word = this.wordList[ childNode.iTextIndex ]
				if ( word.indexOf(pattern) === 0 )
					return 1
				
				continue
			}
			
			return this.likeStringCount(pattern, childNode, i + 1)
		}
		
		return 0
	}
	async likeStringCountAsync(pattern, node = this.root, i = 0) {
		try {
			return this.likeStringCount(pattern, node, i)
		} catch(e) {
			await this.load()
			return this.likeStringCountAsync(pattern, node, i)
		}
	} 
	
}

class Control {
	constructor() {
	}

	async open() {

		this.idbkv = new IDBKeyValue("tree-memory")
		await this.idbkv.open()

		this.idbkvWords = new IDBKeyValue("words-memory2")
		await this.idbkvWords.open()
		
		this.treeMemory = new TreeMemory(this.idbkv, this.idbkvWords)
		await this.treeMemory.open()
		
	}
	async save() {
		await this.treeMemory.save()		
	}
	
	async addWord(word) {
		await this.treeMemory.addAsync(word)
	}
	async generate(len = 100, N = 1e3) {		
		let i = 0, j = 0, k = 0
		repeat:
		while(1) {
			try {
				while(1) {
					const str = this.getStringRand(len)
					this.treeMemory.add( str )
					
					if ( ++i >= N ) {
						break repeat
					}
					
					if ( j++ >= 1e5 ) {
						this.treeMemory.saveNotSafeStringsAsync()
						j = 0
					}
					
					if ( ++k >= N / 1000 ) {
						k = 0
						this.informProgress(i, N)
					}
				}
			} catch(e) {
				await this.treeMemory.load()
			}
		}
		
		await this.treeMemory.save()
	}
	async searchCount(pattern) {
		return await this.treeMemory.likeStringCountAsync(pattern)
	}

	getLetterRand() {
		const l = Math.random() * 52 | 0
		return String.fromCharCode(l < 26 ? l + 65 : l + 71)
	}
	getStringRand(len = 100) {
		let s = ""
		while(len--)
			s += this.getLetterRand()
		return s
	}

	informProgress(current, total) {
		if ( this.onInformProgress )
			this.onInformProgress({ current, total })
	}

	async action({action, args}) {
		let result
		
		if ( !this._process ) {
			this._process = true
			try {
				result = this[action](...args)
			} catch(e) {
				console.log(e)
			}
			this._process = false
		}
		
		return result
	}
}

;(async() => {

	const { Rpc } = await import("./rpc.js")

	const c = new Control()
	await c.open()

	const rpc = new Rpc()
	rpc.addMethods({
		save: (...args) => c.action({ action: "save", args }),
		
		addWord: (...args) => c.action({ action: "addWord", args }),
		generate: (...args) => c.action({ action: "generate", args }),
		searchCount: (...args) => c.action({ action: "searchCount", args }),
	})
	c.onInformProgress = info => rpc.informProgress(info).catch(_ => _)
	
	rpc.setOut(msg => postMessage(msg))
	globalThis.onmessage = ({data}) => rpc.getIn()(data)
	
	rpc.workerReady().catch(_=>_)
})();
