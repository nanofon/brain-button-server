export class BiMap {
    constructor(){
        this.data = new Set()
        this.reverseData = new Set()
    }

    get(key){
        return this.data[key] || this.reverseData[key]
    }

    add(key, value){
        this.remove(key)
        this.remove(value)
        this.data[key] = value
        this.reverseData[value] = key
    }

    remove(key) {
        let other = this.get(key)
        delete this.data[key] | this.reverseData[key]
        delete this.reverseData[other] | this.data[other]
    }
}