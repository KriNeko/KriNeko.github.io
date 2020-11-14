
const byteToHex = b =>
	b.toString(16).padStart(2, '0').toUpperCase()
	
class FS {
	constructor(dir) {
		this.dir = dir
	}
	
	_pathBuild(...args) {
		return args.filter(Boolean).join('/')
	}
	_path(path = '') {
		return path.replace(/\\/g, '/').split('/').filter(Boolean)
	}
	_options(options) {
		return {
			create: true,
			...options
		}
	}
	async mkdir(path, options) {
		const pathParts = this._path(path)
		options = this._options(options)
		
		let node = this.dir
		for(const flatDir of pathParts)
			node = await node.getDirectoryHandle(flatDir, options)
		
		return new this.constructor(node)
	}

	async openFile(path, options) {
		const pathParts = this._path(path)

		let node = this.dir
		for(const flatDir of pathParts.slice(0, -1))
			node = await node.getDirectoryHandle(flatDir, options)
		
		return node.getFileHandle(pathParts.pop(), options)
	}
	async readFileAsText(path) {
		const file = await this.openFile(path)
		
		return await ( await file.getFile() ).text()
	}
	async readFileAsBinary(path) {
		const file = await this.openFile(path)
		
		return await ( await file.getFile() ).arrayBuffer()
	}
	async writeFile(path, data, options) {
		options = {
			create: true,
			...options
		}

		const file = await this.openFile(path, options)
		const wr = await file.createWritable()
		const wrt = await wr.getWriter()
		
		await wrt.write(data)
		await wrt.close()
	}

	async getDir(path, options) {
		const result = []
		const pathParts = this._path(path)
		
		let node = this.dir
		for(const flatDir of pathParts)
			node = await node.getDirectoryHandle(flatDir, options)
	
		return new this.constructor(node)
	}
	async readdir(path) {
		const result = []
		
		const dir = await this.getDir(path)
		for await(const node of dir.dir.values()) {
			const type = node.kind
			const name = node.name
			
			result.push({ kind: node.kind, type, name })
		}
		
		return result
	}
	async readdirDeep(path) {
		const result = await this.readdir(path)
		for(const node of result)
			node.children = ( node.type === 'directory' ) ?
				await this.readdirDeep( this._pathBuild(path , node.name) ): []

		return result
	}
	async readdirDeepFlat(path) {
		const result = []
		const processDir = (dir, base = []) => {
			dir
				.map(d => {
					const pathParts = [...base, d.name]
					d.path = pathParts.join('/')
					result.push(d)

					if ( d.type === 'directory' )
						processDir(d.children, pathParts)
				})
		}
		processDir( await this.readdirDeep(path) )
		return result
	}
}

async function setup() {
	const rootDir = new FS( await showDirectoryPicker() )
	const workDir = await rootDir.mkdir('regina-dir') /// work dir

	for(let i = 0; i <= 0xFF; i++)
		await workDir.mkdir( `cache/${ byteToHex(i) }`)

	await workDir.writeFile('test-file.txt', `
Тестовый текст
UwU
	`)
	
	await workDir.writeFile('tmp/tmp2/tmp3/tmp4/file.txt', 'deep file')
	
	console.log( await workDir.readFileAsText('test-file.txt') )
	
	const text = `Files: \n` +
	( await rootDir.readdirDeepFlat() )
		.map(v => v.type ==='directory' ? v.path + '/' : v.path)
		.join('\n')
	
	await workDir.writeFile('files.txt', text)
}

window.addEventListener('click', setup)
